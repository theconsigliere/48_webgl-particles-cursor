uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

attribute float aIntensity;

varying vec3 vColor;

void main()
{

   // Displacement
   // update the position based on the displacement glow 
    vec3 newPosition = position;
    // using texture() according to the uv and only keeping the r channel because it’s a grayscale image. 
    // Save the result in a float displacementIntensity variable
    float displacementIntensity = texture(uDisplacementTexture, uv).r;

    // Direction we wnat to move the vertices
        vec3 displacement = vec3(
        0.0,
        0.0,
        1.0
    );

    // Move the vertices
    displacement *= displacementIntensity;
    displacement *= 3.0;
    // intensity is a random value
    displacement *= aIntensity;
    
    newPosition += displacement;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // Picture
    // will be rendered grayscale so we only need the red channel
     float pictureIntensity = texture(uPictureTexture, uv).r;
//    float pictureIntensity = texture(uDisplacementTexture, uv).r;

    // Point size
    gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    // crush the values so the discs are bigger for white and smaller for black
    vColor = vec3(pow(pictureIntensity, 2.0));
}