function torus() {
    var innerRadius = 0.2;
    var outerRadius = 0.5;
    var rings = 30;
    var sides = 20;
    for (var i = 0; i < rings; i++) {
        for (var j = 0; j < sides; j++) {
            var theta = j * 2 * Math.PI / sides;
            var phi = i * 2 * Math.PI / rings;
            var x = (outerRadius + innerRadius * Math.cos(phi)) * Math.cos(theta);
            var y = (outerRadius + innerRadius * Math.cos(phi)) * Math.sin(theta);
            var z = innerRadius * Math.sin(phi);
            var normal = vec3(x, y, z);
            var position = vec3(x, y, z);
            normalsArray.push(normal);
            pointsArray.push(position);
            numVertices++;
        }
    }

    for (var i = 0; i < rings; i++) {
        for (var j = 0; j < sides; j++) {
            var index1 = (i * sides + j) + 36;
            var index2 = (i * sides + (j + 1) % sides) + 36;
            var index3 = ((i + 1) % rings * sides + j) + 36;
            var index4 = ((i + 1) % rings * sides + (j + 1) % sides) + 36;
            triangle(pointsArray[index1], pointsArray[index2], pointsArray[index3]);
            triangle(pointsArray[index2], pointsArray[index4], pointsArray[index3]);
        }
    }
}

function ellipsoid() {
    var a = 1.0; 
    var b = 0.5; 
    var c = 0.5; 
    var stacks = 20; 
    var slices = 20; 

    for (var i = 0; i <= stacks; i++) {
        var phi = Math.PI * i / stacks;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        for (var j = 0; j <= slices; j++) {
            var theta = 2 * Math.PI * j / slices;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            var x = a * sinPhi * cosTheta;
            var y = b * sinPhi * sinTheta;
            var z = c * cosPhi;

            var normal = vec3(x/a, y/b, z/c);
            var position = vec3(x, y, z);

            normalsArray.push(normal);
            pointsArray.push(position);
            numVertices++;
        }
    }

    for (var i = 0; i < stacks; i++) {
        for (var j = 0; j < slices; j++) {
            var index1 = i * (slices + 1) + j + 36;
            var index2 = i * (slices + 1) + j + 1 + 36;
            var index3 = (i + 1) * (slices + 1) + j + 1 + 36;
            var index4 = (i + 1) * (slices + 1) + j + 36;

            triangle(pointsArray[index1], pointsArray[index2], pointsArray[index3]);
            triangle(pointsArray[index1], pointsArray[index3], pointsArray[index4]);
        }
    }
}

function triangle(a, b, c) {

    normalsArray.push(a);
    normalsArray.push(b);
    normalsArray.push(c);
    
    pointsArray.push(a);
    pointsArray.push(b);      
    pointsArray.push(c);

    numVertices += 3;
}

var box = [
    vec3( -1.50, -1.50,  0.95),
    vec3( -1.50,  1.50,  0.95),
    vec3( 1.50,  1.50,  0.95),
    vec3( 1.50, -1.50,  0.95),
    vec3( -1.50, -1.50, -0.95),
    vec3( -1.50,  1.50, -0.95),
    vec3( 1.50,  1.50, -0.95),
    vec3( 1.50, -1.50, -0.95)
];

var modelView, projection;

// ================ create geometry functions 
function quad(a, b, c, d) {

    var t1 = subtract(box[b], box[a]);
    var t2 = subtract(box[c], box[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    normal = normalize(normal);

    pointsArray.push(box[a]); 
    normalsArray.push(normal); 
    pointsArray.push(box[b]); 
    normalsArray.push(normal); 
    pointsArray.push(box[c]); 
    normalsArray.push(normal);   
    pointsArray.push(box[a]);  
    normalsArray.push(normal); 
    pointsArray.push(box[c]); 
    normalsArray.push(normal); 
    pointsArray.push(box[d]); 
    normalsArray.push(normal);    
}


function cube()
{
    quad( 0, 3, 1, 2 );
    quad( 2, 3, 6, 7);
    quad( 3, 7, 0, 4 );
    quad( 6, 5, 2, 1 );
    quad( 4, 5, 7, 6 );
    quad( 5, 4, 1, 0 );
}
