// global variable for the drawing area and webgl context
var canvas;
var gl;

var justOne = 0;

//Initializing variables which are used later in the program
var colors = [];
var centers = [];
var verticies = [];

// initialize the object to not be rotated
var theta = 0.0;
var theta2 = 0.0;

var deltaRadians =  (3.149 / 3)  / 100;

// to allow rotation thru colors
var baseColors = [
    vec3(0.4, 0.5, 0.5),		//light blue
	vec3(0.1, 0.5, 0.5),		//dark blue
    vec3(1.0, 0.75, 0.1),		//yellow
    vec3(1.0, 0.9, 0.5),		//light yellow
	vec3(0, 0, 0),				//black
	vec3(1, 1, 1)				//white
];


// When all the files have been read, the window system call the init function that holds our program
// This is an example of an event listener/handler
window.onload = function init()
{
	// document is refering to the document object model (DOM)
	// This allows us to communicate with the HTML web page
	// We are creating a short name for the canvas/drawing space
    canvas = document.getElementById( "gl-canvas" );
    
	// set up to use webgl in the canvas
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height);
	
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

	//Verticies displayed as the image */
	var vertices = [
		vec2(0.1, 0.06),		//first body triangle
		vec2(0.1, -0.06),
		vec2(-0.1, 0.06),
		vec2(0.1, -0.06),		//second body triangle
		vec2(-0.1, 0.06),
		vec2(-0.1, -0.06),
		vec2(-0.03, 0),		//Eye 1
		vec2(-0.06, 0),
		vec2(-0.06, 0.03),
		vec2(-0.03, 0.03),		//Eye 2
		vec2(-0.06, 0.03),
		vec2(-0.03, 0),
		vec2(-0.035, 0.015),		//Eye Pupil 1
		vec2(-0.045, 0.015),
		vec2(-0.045, 0.025),
		vec2(-0.035, 0.025),		//Eye Pupil 2
		vec2(-0.045, 0.025),
		vec2(-0.035, 0.015),
		vec2(-0.1, 0),		//First part of the beak
		vec2(-0.1, -0.06),
		vec2(-0.14, 0),
		vec2(-0.14, 0),		//Second part of the beak
		vec2(-0.1, -0.06),
		vec2(-0.14, -0.06),
		vec2(-0.14, 0),		//First part of the beak 2
		vec2(-0.14, -0.06),
		vec2(-0.18, 0),
		vec2(-0.18, 0),		//Second part of the beak 2
		vec2(-0.14, -0.06),
		vec2(-0.18, -0.06),
		vec2(0.1, 0),		//First part of the tail
		vec2(0.1, -0.06),
		vec2(0.14, 0),
		vec2(0.14, 0),		//Second part of the tail
		vec2(0.1, -0.06),
		vec2(0.14, -0.06),
		vec2(0.14, 0),		//First part of the tail 2
		vec2(0.14, -0.06),
		vec2(0.18, 0),
		vec2(0.18, 0),		//Second part of the tail 2
		vec2(0.14, -0.06),
		vec2(0.18, -0.06),
		vec2(0.18, 0),		//First part of the tail 3
		vec2(0.18, -0.06),
		vec2(0.22, 0),
		vec2(0.22, 0),		//Second part of the tail 3
		vec2(0.18, -0.06),
		vec2(0.22, -0.06),
		vec2(0.1, -0.06),		//back foot
		vec2(0.115, -0.1),
		vec2(0.085, -0.1),
		vec2(0.085, -0.1),
		vec2(0.1, -0.06),
		vec2(0.07, -0.06),
		vec2(-0.085, -0.1),	//front foot
		vec2(-0.1, -0.06),
		vec2(-0.07, -0.06),
		vec2(-0.07, -0.06),
		vec2(-0.085, -0.1),
		vec2(-0.055, -0.1),		
	]

	centers = [
		vec2(0.0, 0.0),			//center 
		vec2(0.0, 0.7),			//top
		vec2(0.42, 0.55),	
		vec2(0.70, 0.25),
		vec2(0.70, -0.25),
		vec2(0.42, -0.55),	
		vec2(0.0, -0.7),			//bottom
		vec2(-0.42, -0.55),
		vec2(-0.70, -0.25),
		vec2(-0.70, 0.25),
		vec2(-0.42, 0.55),
	]

	setcolors();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
	// do same for colors
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    // draw 

	// associate shader theta variable    
    thetaLoc = gl.getUniformLocation( program, "theta" );
	centersLoc = gl.getUniformLocation( program, "centers");

    justOne = 0;
	render();
	
};


function render() {
	
	// clear the background
	// another example of a webgl constant - it is a bitmask
	// it will clear using the color defined in gl.clearColor
    
    gl.clear( gl.COLOR_BUFFER_BIT );

	
	//clockwise rotation for the center 
    theta += (false? deltaRadians : -deltaRadians);
	gl.uniform1f(thetaLoc, theta);

	//draw the center 
	gl.uniform2fv(centersLoc, centers[0]);
	gl.drawArrays(gl.TRIANGLES, 0, 62);
	
	//counterclockwise rotation for the replica shapes
	theta2 += (true? deltaRadians : -deltaRadians);
	gl.uniform1f(thetaLoc, theta2);

	//draw the replicas
	for(var i = 1; i < centers.length; i++) {
		gl.uniform2fv(centersLoc, centers[i]);
		gl.drawArrays(gl.TRIANGLES, 0, 62);
	}

	//start the animation
	window.requestAnimFrame(render);
}

function setcolors()
{
	// colors for the vertices of the square
colors = [
        baseColors[0],
        baseColors[0],
        baseColors[1],
        baseColors[0],
		baseColors[1],
		baseColors[1],
		baseColors[4],
		baseColors[4],
		baseColors[4],
		baseColors[4],
		baseColors[4],
		baseColors[4],
		baseColors[5],
		baseColors[5],
		baseColors[5],
		baseColors[5],
		baseColors[5],
		baseColors[5],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[2],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[0],
		baseColors[1],
		baseColors[1],
		baseColors[1],
		baseColors[1],
    ];
}
