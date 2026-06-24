struct Uniforms {
    resolution: vec2<f32>,
    padding: f32,
    corner_radius: f32,
    background: f32,
    value: f32,
    _pad1_: f32,
    _pad2_: f32,
}

@group(0) @binding(0) var<uniform> u_uniforms: Uniforms;
@group(0) @binding(1) var u_sampler: sampler;
@group(0) @binding(2) var u_lut: texture_2d<f32>;

struct FragmentInput {
    @builtin(position) fragCoord: vec4<f32>,
}

// Clean, optimized Signed Distance Field for a box with uniform corner radii
fn sd_rounded_box(p: vec2<f32>, b: vec2<f32>, r: f32) -> f32 {
    let d = abs(p) - b + vec2<f32>(r);
    return length(max(d, vec2<f32>(0.0))) + min(max(d.x, d.y), 0.0) - r;
}

// High-performance screen-space dither to mask bit-depth quantization steps
fn screenSpaceNoise(uv: vec2<f32>) -> f32 {
    return fract(sin(dot(uv, vec2<f32>(12.9898, 78.233))) * 43758.5453123);
}

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
    let mid = u_uniforms.resolution * 0.5;
    let r = vec2<f32>(input.fragCoord.x - mid.x, mid.y - input.fragCoord.y);
    
    // Calculate the half-size boundaries of the internal square picker
    let box_half_size = mid - vec2<f32>(u_uniforms.padding);
    let distance = sd_rounded_box(r, box_half_size, u_uniforms.corner_radius);

    let bg = u_uniforms.background;
    let targetBgColor = vec3<f32>(bg, bg, bg);

    // Creates a smooth 1-pixel anti-aliased edge window around the perimeter
    let boxBlend = smoothstep(-0.5, 0.5, distance);

    // If completely outside the anti-aliased edge of the rounded box, return the background color immediately
    if (distance > 0.5) {
        return vec4<f32>(targetBgColor, 1.0);
    }

    // Map the relative radial vector directly into standard 0.0 -> 1.0 UV space
    var uv = (r / box_half_size) * 0.5 + 0.5;
    uv = clamp(uv, vec2<f32>(0.0), vec2<f32>(1.0));

    // Sample the high-precision texture
    let sampledColor = textureSampleLevel(u_lut, u_sampler, uv, 0.0);
    var finalColor = sampledColor.rgb;

    // Apply high-frequency noise right before color composition to completely eliminate banding
    let noise = screenSpaceNoise(input.fragCoord.xy);
    finalColor += (noise - 0.5) * (1.0 / 255.0);

    // Smoothly blend your picker colors into your page background to prevent the HDR compositor halo
    finalColor = mix(finalColor, targetBgColor, boxBlend);

    // Return a rock-solid, fully opaque alpha channel
    return vec4<f32>(finalColor, 1.0);
}