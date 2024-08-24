var canvas;
var gl;
var cubesInput, sizeInput, speedInput;

var NumVertices = 36;

var points = [];
var colors = [];
var translateMatrix = [
    [0.0, 0.0]
];
var translations = [
    [0.0, 0.0, 0.0]
];
var rotation = 0.0;

var isRender = true;
var createMatrix = true;

var mvMatrix, mvMatrix2;
var modelView;

var vertices = [
	vec3( 0.0, 0.0,  0.0),
	vec3( 0.0, 1.0,  0.0 ),
	vec3( 1.0, 1.0,  0.0 ),
	vec3( 1.0, 0.0,  0.0 ),
	vec3( 0.0, 0.0, -1.0 ),
	vec3( 0.0, 1.0, -1.0),
	vec3( 1.0, 1.0, -1.0 ),
	vec3( 1.0, 0.0, -1.0 )
];

// Create your own colors!!
var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 1.0, 1.0, 0.4, 1.0 ],  // white --- not a good idea
    [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
];

window.onload = function init()
{
    canvas = document.getElementById( 'gl-canvas' );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    createCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
	// try turning off to demo z-buffer HSR NOT
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    //gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    // can demo error that happens if input '3' rather than '4'
    var vColor = gl.getAttribLocation( program, 'vColor' );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    //gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );

     // also demo 2 or 4 here
    var vPosition = gl.getAttribLocation( program, 'vPosition' );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //define model matrix and set the initial value
    modelView = gl.getUniformLocation( program, 'modelView' );
	mvMatrix = mat4();
    mvMatrix = mult(translate(-0.05,-0.05, 0), scalem(0.01 * 10, 0.01 * 10, 0.01 * 10));
    mvMatrix2 = mat4();

    //creating vars to store slider locations and values
    let myInputs = document.querySelectorAll('input');
    cubesInput = myInputs[0];
    sizeInput = myInputs[1];
    speedInput = myInputs[2];

    //some html stuff to prevent console overloading when I play with the scale (also it looks better)
    myOutputs = document.querySelectorAll('output'),
    cubesOutput = myOutputs[0],
    sizeOutput = myOutputs[1],
    speedOutput = myOutputs[2];

    //set text to initial values of sliders
    cubesOutput.innerHTML = cubesInput.value;
    sizeOutput.innerHTML = sizeInput.value;
    speedOutput.innerHTML = speedInput.value;

    //Create event handler to update whenever the slider changes (text change, console flooding is bad)
    cubesInput.addEventListener('input', function () {
        cubesOutput.innerHTML = cubesInput.value;
      }, false);
    sizeInput.addEventListener('input', function () {
        sizeOutput.innerHTML = sizeInput.value;
        mvMatrix = mult(translate(-0.01 * sizeInput.value / 2, -0.01 * sizeInput.value / 2, 0), scalem(0.01 * sizeInput.value, 0.01 * sizeInput.value, 0.01 * sizeInput.value));
        mvMatrix2 = scalem(0.01 * sizeInput.value, 0.01 * sizeInput.value, 0.01 * sizeInput.value);
      }, false);
    speedInput.addEventListener('input', function () {
        speedOutput.innerHTML = speedInput.value;
      }, false);
    //Create event handler for when the square gets clicked 
    canvas.addEventListener('mousedown', function(){
        //determines the position of the mouse with X and Y values
        var screenx = event.clientX - canvas.offsetLeft;
		var screeny = event.clientY - canvas.offsetTop;
		var posX = 2*screenx/canvas.width-1;
		var posY = 2*(canvas.height-screeny)/canvas.height-1;

        //Determines if the square has been clicked, executes the statement if yes
        if((sizeInput.value * 0.01) / 2 >= posX && -(sizeInput.value * 0.01) / 2 <= posX && (sizeInput.value * 0.01) / 2 >= posY && -(sizeInput.value * 0.01) / 2 <= posY) {
            console.log("Square Clicked");  //console help
            isRender = !isRender;       //toggle rendering
            
        }
    }, false); 
    render();
}

	
function createCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
	
}

function quad(a, b, c, d) 
{

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];


    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
         
        // solid colored faces -- use the first vertex index as color index (all unique, so okay)
        colors.push(vertexColors[a]);
        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );     
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    if(createMatrix == true) {
        createMatrix = false;
        for(var i = 1; i <= 50; i ++) {
            translations[i] = [0.0, 0.0];
            translateMatrix[i] = [Math.random() * ((0.5 - 0.4) + 0.4),Math.random() * ((1 - 0.5) + 0.4)]
            if(i % 4 == 0) {
                translateMatrix[i][0] = -translateMatrix[i][0];
                translateMatrix[i][1] = -translateMatrix[i][1];
            } else if(i % 3 == 0) {
                translateMatrix[i][1] = -translateMatrix[i][1];
            } else if (i % 2 == 0) {
                translateMatrix[i][0] = -translateMatrix[i][0];
            }
        }
    }
    if(isRender == true) {
        rotation += (speedInput.value * 0.4);
    }
    for(var i = 1; i <= cubesInput.value; i ++) {
        //adding to the rotationMatrix and initializing the size of the cubes
        mvMatrix2 = mult(translate(-0.01 * sizeInput.value / 2, -0.01 * sizeInput.value / 2, 0), scalem(0.01 * sizeInput.value, 0.01 * sizeInput.value, 0.01 * sizeInput.value));
        //First loop, when the cubes are first spawning, translate them to the proper position
        mvMatrix2 = mult(rotate(rotation, 1.0, 1.0, 1.0), mvMatrix2);
        if(isRender == true) {
            translations[i][0] += translateMatrix[i][0] * (speedInput.value * 0.001);
            translations[i][1] += translateMatrix[i][1] * (speedInput.value * 0.001);
        }
        mvMatrix2 = mult(translate(translations[i][0], translations[i][1], 0.0), mvMatrix2);
        //draws in the values using the new matricies
        gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix2));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    }
    //repeat condition, periodically occurs
    if(rotation >= 720) {
        rotation = 0;
        createMatrix = true;
    }

    window.requestAnimFrame(render);
}



