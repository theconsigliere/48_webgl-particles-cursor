uniform vec2 uResolution;
uniform sampler2D uPictureTexture;

varying vec3 vColor;

void main()
{
    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // Picture
    // will be rendered grayscale so we only need the red channel
    float pictureIntensity = texture(uPictureTexture, uv).r;

    // Point size
    gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    // crush the values so the discs are bigger for white and smaller for black
    vColor = vec3(pow(pictureIntensity, 2.0));
}