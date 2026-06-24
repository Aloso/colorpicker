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

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
    let mid = u_uniforms.resolution * 0.5;
    let r = input.fragCoord.xy - mid;
    let radius = mid.x - u_uniforms.padding;

    let fromCenter = length(r) / radius;

    // Standard anti-aliased circle mask
    let edgeWindow = 1.0 / radius;
    let circleBlend = smoothstep(1.0 - edgeWindow, 1.0, fromCenter);
    let bg = u_uniforms.background;

    if (fromCenter > 1.0 + edgeWindow) {
        return vec4<f32>(bg, bg, bg, 1.0);
    }

    let uv = (r / radius) * 0.5 + 0.5;

    // WebGPU separates textures and samplers
    let sampledColor = textureSampleLevel(u_lut, u_sampler, uv, 0.0);
    let targetBgColor = vec3<f32>(bg, bg, bg);
    let finalColor = mix(sampledColor.rgb, targetBgColor, circleBlend);

    return vec4<f32>(finalColor, 1.0);
}