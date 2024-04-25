varying vec3 vColor;

void main()
{
    // CREATE DISCS
    // First, we want the UV coordinates inside the particle, and since they are points, we can use the gl_PointCoord
    vec2 uv = gl_PointCoord;
    // Get the middle of the particle
    float distanceToCenter = distance(uv, vec2(0.5));
    // we want to discard the fragment when the distanceToCenter is above 0.5 aka remove white outside the circle
    if (distanceToCenter > 0.5)
        discard;
    

    gl_FragColor = vec4(vColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}