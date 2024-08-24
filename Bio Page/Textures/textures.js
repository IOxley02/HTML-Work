var canvas;
var gl;

// shape definition
var numVertices = 0;
var numBoxVerticies = 36;
var numFloorVerticies = 6;
var pointsArray = [];
var normalsArray = [];
var shapePosition = 0
var shapeVelocity = 0.03;
var reload = 0;
var shape = 'torus';
var isFirst = true;

//texture definition
var texCoordsArray = [];
var texture;
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


// eye location and parameters to move
var viewer = 
{
	eye: vec3(0.0, 0.0, 3.0),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: 3,
    theta: 0,
    phi: 0
};

// perspective values
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = 0.0015;
var farFactor = 3.0;
var far = viewer.radius * farFactor;
var fov = 60.0;
var useOrtho = true;

// create scaled versions of input materials
// copied below in init function
var mA = vec4( 0.0, 0.0, 0.0, 1.0 );
var mD = vec4( 0.0, 0.0, 0.0, 1.0 );
var mS = vec4( 0.0, 0.0, 0.0, 1.0 );
var mShini = 1.0;

 
// sphere initial points
var va = vec3(0.0, 0.0, -1.0);
var vb = vec3(0.0, 0.942809, 0.333333);
var vc = vec3(-0.816497, -0.471405, 0.333333);
var vd = vec3(0.816497, -0.471405, 0.333333);
    
//original face light position
var lightPosition = vec4(3.0, 3.0, 5, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

// original gold-yellow material
var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 10.0;

var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;


// ======================== sphere definition functions

function reset() {
    numVertices = 0;
    pointsArray = []; 
    normalsArray = [];
}

function round(n) {
    return n >= 10 ? "" + n: "0" + n;
}
function randomize(a, b) {
    let randomVal = Math.random()
    if(randomVal <= 0.25) {
        shapeVelocity[a] = -1 * (Math.random() * (0.008 - 0.001) + 0.001);
        shapeVelocity[b] = -1 * (Math.random() * (0.008 - 0.002) + 0.001);
    } else if(randomVal >= 0.25 && randomVal<= 0.50) {
        shapeVelocity[a] = -1 * (Math.random() * (0.008 - 0.001) + 0.001);
        shapeVelocity[b] = 1 * (Math.random() * (0.008 - 0.002) + 0.001);
    } else if(randomVal >= 0.50 && randomVal<= 0.70) {
        shapeVelocity[a] = 1 * (Math.random() * (0.008 - 0.001) + 0.001);
        shapeVelocity[b] = -1 * (Math.random() * (0.008 - 0.002) + 0.001);
    } else {
        shapeVelocity[a] = 1 * (Math.random() * (0.008 - 0.001) + 0.001);
        shapeVelocity[b] = 1 * (Math.random() * (0.008 - 0.002) + 0.001);
    }
}

function configureTexture( myimage ) {
	// gif image needs flip of y-coord
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myimage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //Load Shaders (1: Basics, 2: Skybox)
    program1 = initShaders( gl, "vertex-shader1", "fragment-shader1" );
    gl.useProgram( program1 );
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	

	//load the box and floor
    cube();

    if(shape == 'torus') {
        torus();
    } else {
        ellipsoid();
    }

    // load the light
	var l3d = vec3(lightPosition[0], lightPosition[1],lightPosition[2]);
    pointsArray.push(l3d); 
	// not used, but diffuse should match points
	normalsArray.push(1.0, 0.0, 0.0); 

	//console.log("normals[1] = ",normalsArray[1]);
	//console.log("points[1] = ",pointsArray[1]);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program1, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program1, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program1, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );


    var myimage = new Image();
	myimage.crossOrigin = "anonymous";
	
	myimage.src = window.woodBoard_data_url;
	
    myimage.onload = function() {
        texture1 = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture1 ); 
        configureTexture( myimage );
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
    }

    gl.uniform1i(gl.getUniformLocation(program1, "texture1"), 0);

    var myimage2 = new Image();
	
    myimage2.onload = function() {
        texture2 = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture2 );
        configureTexture( myimage2 );
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2);
    }

    myimage2.crossOrigin = "anonymous";
	
	myimage2.src = window.metalFloor_data_url;

    gl.uniform1i(gl.getUniformLocation(program1, "texture2"), 0);
    
    modelViewMatrixLoc = gl.getUniformLocation( program1, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program1, "projectionMatrix" );

    // define mouse event listeners
	mouseControls();

    //Functions for handling surface type
    document.getElementById("buttonTorusSurface").onclick = function(){ 
        shape = 'torus';
        reset();
        init();
    };
    document.getElementById("buttonEllipsoidSurface").onclick = function(){ 
        shape = 'helix';
        reset();
        init();
    };

    //Functions for handling light control
    document.getElementById("buttonLeftLight").onclick = function(){
        lightPosition = vec4(-1.0, 1.0, -2.0, 1.0 );
        reset();
        init();
    };
    document.getElementById("buttonFaceLight").onclick = function(){
        lightPosition = vec4(3.0, 3.0, 5, 1.0 );
        reset();
        init();
    };
    document.getElementById("buttonRightLight").onclick = function(){
        lightPosition = vec4(1.0, 1.0, -2.0, 1.0 );
        reset();
        init();
    };

    //Functions for handling Material Properties
    //creating vars to store slider locations and values
    let myInputs = document.querySelectorAll('input');
    ambientInput = myInputs[0];
    diffuseInput = myInputs[1];
    specularInput = myInputs[2];
    shininessInput = myInputs[3];

    //some html stuff to prevent console overloading when I play with the scale (also it looks better)
    myOutputs = document.querySelectorAll('output'),
    verticiesOutput = myOutputs[0];
    trianglesOutput = myOutputs[1];
    ambientOutput = myOutputs[2],
    diffuseOutput = myOutputs[3],
    specularOutput = myOutputs[4];
    shininessOutput = myOutputs[5];

    //set text to initial values of sliders
    verticiesOutput.innerHTML = numVertices;
    trianglesOutput.innerHTML = numVertices / 3;
    ambientOutput.innerHTML = (ambientInput.value * 100).toFixed(1) + "%";
    diffuseOutput.innerHTML = (diffuseInput.value * 100).toFixed(1) + "%";
    specularOutput.innerHTML = (specularInput.value * 100).toFixed(1) + "%";
    shininessOutput.innerHTML = (shininessInput.value * 100).toFixed(1) + "%";

    ambientInput.addEventListener('input', function () {
        var materialAmbScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			mA[i] = materialAmbScale * materialAmbient[i];
		console.log("new materialAmbient = ",mA);
		ambientProduct = mult(lightAmbient, mA);
		gl.uniform4fv(gl.getUniformLocation(program1, "ambientProduct"),
       flatten(ambientProduct));
       ambientOutput.innerHTML = round((ambientInput.value * 100).toFixed(1)) + "%";
    });
	
	diffuseInput.addEventListener('input', function () {
        var materialDiffScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			mD[i] = materialDiffScale * materialDiffuse[i];
		
		console.log("Diffuse scale = ",materialDiffScale);
		console.log("new materialDiffuse = ",mD);
		diffuseProduct = mult(lightDiffuse, mD);
		gl.uniform4fv(gl.getUniformLocation(program1, "diffuseProduct"),
       flatten(diffuseProduct));
       diffuseOutput.innerHTML = round((diffuseInput.value * 100).toFixed(1)) + "%";
	}, false);
	
	specularInput.addEventListener('input', function () {
        var materialSpecScale = event.srcElement.value;
		for(var i=0; i<3; i++)
			mS[i] = materialSpecScale * materialSpecular[i];
		console.log("new materialSpecular = ",mS);
		specularProduct = mult(lightSpecular, mS);
		gl.uniform4fv(gl.getUniformLocation(program1, "specularProduct"),
       flatten(specularProduct));
       specularOutput.innerHTML = round((specularInput.value * 100).toFixed(1)) + "%";
    }, false);
	
	shininessInput.addEventListener('input', function () {
        var materialShiniScale = event.srcElement.value;
		mShini = materialShiniScale * materialShininess;
		console.log("new materialShininess = ",mShini);
		gl.uniform1f( gl.getUniformLocation(program1, 
       "shininess"),mShini ); 
       shininessOutput.innerHTML = round((shininessInput.value * 100).toFixed(1)) + "%";
    }, false);

    //Choose between ortho or perspective
    document.getElementById("buttonOrtho").onclick = function(){
        projectionMatrix = ortho(left, right, bottom, ytop, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    };
    document.getElementById("buttonPerspective").onclick = function(){
        projectionMatrix = perspective(fov, 1.0, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    };

    gl.uniform4fv( gl.getUniformLocation(program1, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program1, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program1, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program1, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program1, 
       "shininess"),materialShininess );

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    if(reload <= 10) {
        reload++;
        reset();
        init();
    } else {
        if(isFirst == true) {
            isFirst = false;
            render();
        }
    }

}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program1);
    //The object slides around the plane, bouncing when it hits an edge
    shapePosition += shapeVelocity;
    if(shapePosition >= 1.5) shapeVelocity = -0.03;
    if(shapePosition <= -1.5) shapeVelocity = 0.03;
    
    //ground plane (using metal image)
    gl.uniform1i(gl.getUniformLocation(program1, "texture2"), 1);
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
    gl.uniform1i( gl.getUniformLocation(program1, "makeFloor"),1 );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, numFloorVerticies);

    //draw the box for the background object (dark green) 
    gl.uniform1i( gl.getUniformLocation(program1, "makeBox"),1 );
    gl.uniform1i( gl.getUniformLocation(program1, "makeFloor"),0 );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, numFloorVerticies, numBoxVerticies);
    
    //draw parametric shape (using wood object)
    gl.uniform1i( gl.getUniformLocation(program1, "colorFlag"),1 );
    gl.uniform1i( gl.getUniformLocation(program1, "makeBox"),0 );
    modelViewMatrix = mult(translate(shapePosition, 0, 0), modelViewMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    for( var i = numBoxVerticies + numFloorVerticies; i < numVertices + numBoxVerticies + numFloorVerticies; i+=3) {
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    modelViewMatrix = mat4();
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniform1i( gl.getUniformLocation(program1, "colorFlag"),0 );
	gl.drawArrays( gl.POINTS, numBoxVerticies + numFloorVerticies + numVertices, 1);

    requestAnimFrame(render);
}
