/*
 GLSL function injection using the shader node

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 For each of our vertex/fragment shaders we can use the shader node to:

 1) inject custom functions - supply fragments of GLSL and bind them to hooks within SceneJS'
 automatically-generated shader

 2) replace the whole shader - we specify a shader complete with a main function and do not specify any bindings,
 causing SceneJS to discard the shader it would have created and substitute ours instead

 In this demo we're just doing (1).

 */

SceneJS.createScene({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv",

    nodes: [

        /* Viewing transform specifies eye position, looking
         * at the origin by default
         */
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 15 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [

                /* Camera describes the projection
                 */
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [


                        /* A lights node inserts point lights into scene, to illuminate everything
                         * that is encountered after them during scene traversal.
                         *
                         * You can have many of these, nested within modelling transforms if you want to move them.
                         */
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 0.8 },
                            diffuse:                true,
                            specular:               false,
                            dir:                    { x: 0.0, y: -0.5, z: -1.0 }
                        },

                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                         * so we can access them to set their angle attributes.
                         */
                        {
                            type: "rotate",
                            id: "pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [

                                        /* Specify the amounts of ambient, diffuse and specular
                                         * lights our teapot reflects
                                         */
                                        {
                                            type: "material",
                                            emit: 0,
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.6 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.7,
                                            shine:          10.0,
                                            alpha: 0.9,

                                            flags: {
                                                transparent: true
                                            },

                                            nodes: [

                                                /*----------------------------------------------------------------------
                                                 * Our shader node defines a GLSL fragment containing a "time" uniform
                                                 * and a function that wobbles a 3D position as a function of that.
                                                 *
                                                 * Then then binds the function to the "modelPos" hook that SceneJS
                                                 * provides within its automatically-generated vertex shader.
                                                 *
                                                 * Within the "idleFunc" callback on our scene render loop (down below),
                                                 * we'll then update the "time" uniform to drive the wobbling.
                                                 *--------------------------------------------------------------------*/

                                                {
                                                    type: "shader",
                                                    id: "myShader",

                                                    shaders: [

                                                        /* Vertex shader
                                                         */
                                                        {
                                                            stage:  "vertex",

                                                            /* GLSL fragment with custom function.
                                                             *
                                                             * The fragment can be given as either a string or an array
                                                             * of strings.
                                                             */
                                                            code: [
                                                                "uniform float time;",

                                                                "vec4 myModelPosFunc(vec4 pos){",
                                                                "   pos.x=pos.x+sin(pos.x*5.0+time+10.0)*0.1;",
                                                                "   pos.y=pos.y+sin(pos.y*5.0+time+10.0)*0.1;",
                                                                "   pos.z=pos.z+sin(pos.z*5.0+time+10.0)*0.1;",
                                                                "   return pos;",
                                                                "}"],

                                                            /* Bind our custom function to a SceneJS vertex shader hook
                                                             */
                                                            hooks: {
                                                                modelPos: "myModelPosFunc"
                                                            }
                                                        },

                                                        /* Fragment shader
                                                         *
                                                         * The fragment can be given as either a string or an array
                                                         * of strings.
                                                         */
                                                        {
                                                            stage:  "fragment",

                                                            code:  [
                                                                "uniform float time;  float time2 = time;",

                                                                "float myMaterialAlphaFunc(float alpha){",
                                                                "   return alpha+sin(time2);",
                                                                "}",

                                                                "void myWorldPosFunc(vec4 worldVertex){",
                                                                "   if (worldVertex.x > 0.0) time2 = time2 * 3.0;",
                                                                "}",

                                                                "vec4 myPixelColorFunc(vec4 color){",
                                                                "   color.r=color.r+sin(time2)*0.3;",
                                                                "   color.g=color.g+sin(time2+0.3)*0.3;",
                                                                "   color.b=color.b+sin(time2+0.6)*0.3;",
                                                                "   color.a=color.a+sin(time2);",
                                                                "   return color;",
                                                                "}",

                                                                "void myEyeVecFunc(vec3 eyeVec){",
                                                                "}",

                                                                "void myNormalFunc(vec3 normal){",
                                                                "}"],

                                                            /* Bind our custom function to a SceneJS vertex shader hook
                                                             */
                                                            hooks: {
                                                                worldPos:       "myWorldPosFunc",
                                                                eyeVec:         "myEyeVecFunc",
                                                                normal:         "normalFunc",
                                                                materialAlpha:  "myMaterialAlphaFunc",
                                                                pixelColor:     "myPixelColorFunc"
                                                            }
                                                        }
                                                    ],

                                                    /* Optional initial values for uniforms within our GLSL:
                                                     */
                                                    vars: {
                                                        time: 0.0
                                                    },


                                                    nodes: [

                                                        /* Inject a variable value into our custom shader:
                                                         */
                                                        {
                                                            type: "shaderVars",

                                                            id: "myShaderVars",

                                                            vars: {
                                                                time: 0.5
                                                            },

                                                            nodes: [

                                                                /* This teapot will enjoy our custom shader injection:
                                                                 */

                                                                {
                                                                    type : "teapot"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});


SceneJS.setDebugConfigs({
    shading : {
        logScripts : false,
        validate: true
    }
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;


var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * 0.5;

        var scene = SceneJS.scene("theScene");

        scene.findNode("yaw").set("angle", yaw);
        scene.findNode("pitch").set("angle", pitch);

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

var time = 0;

SceneJS.scene("theScene").start({
    idleFunc: function() {
        this.findNode("myShaderVars").set("vars", {
            time: time ,
            time2: time
        });
        time += 0.1;
    }
});

