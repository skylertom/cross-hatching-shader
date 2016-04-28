var stack = [];
var myFaceList = [];    //list of faces
var myVertexList = [];  //list of vertices

var Face = function(id) {
    this.id = id;
    this.vertexList = [];

    this.setVertices = function (v1, v2, v3) {
        this.vertexList.push(v1);
        this.vertexList.push(v2);
        this.vertexList.push(v3);
    }
}

var Vertex = function (id) {
    this.id = id;
    this.x = this.y = this.z = 0;

    this.setPosition = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

function parse (filename, vertexList, faceList) {  //simplified parser for PLY file
    var properties = -2;
    var vertexCount = 0;
    var faceCount = 0;

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", filename, true);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
        	if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
        	    var lines = allText.split ('\n');

        	    var tmpLineIndex = 0;
        	    for (var i = 0; i<lines.length; i++) {
            		var line = lines[i].trim();
            		var tokens = line.split(' ');
            		var head = tokens[0].trim();
            		if (head.toLowerCase() == "element") {
            		    // When the vertex token is spotted read in the next token
            		    // and use it to set the vertexCount and initialize vertexList
            		    if (tokens[1].trim().toLowerCase() == "vertex"){
                			vertexCount = Number(tokens[2]);
            		    }

            		    // When the face label is spotted read in the next token and
            		    // use it to set the faceCount and initialize faceList.
            		    if (tokens[1].trim().toLowerCase() == "face"){
                			faceCount = Number(tokens[2]);
            		    }
            		}
            		else if (head.toLowerCase() == "property") {
            		    properties++;
            		}
        	    	else if (head.toLowerCase() == "end_header") {
            		    tmpLineIndex = i+1;
            		    break;
            		}
        	    }

        	    var id = 0;
        	    var numVertices = Number(tmpLineIndex) + Number(vertexCount);
        	    for (var i = tmpLineIndex; i<numVertices; i++) {
            		var line = lines[i].trim();

            		var tokens = line.split(' ');

            		// depending on how many properties there are set that number of
            		// elements (x, y, z, confidence, intensity, r, g, b) (max 7) with
            		// the input given

            		var v = new Vertex(id++);
            		if (properties >= 0){
            		    v.x = tokens[0].trim();
            		}
            		if (properties >= 1){
            		    v.y = tokens[1].trim();
            		}
            		if (properties >= 2){
            		    v.z = tokens[2].trim();
            		}
            		if (properties >= 3){
            		    //v.confidnece
            		}
            		if (properties >= 4){
            		    //v.intensity
            		}
            		if (properties >= 5){
            		    //v.r
            		}
            		if (properties >= 6) {
            		    //v.g
            		}
            		if (properties >= 7) {
            		    //v.b
            		}

            		vertexList.push(v);
        	    }

        	    tmpLineIndex = i;
        	    id = 0;
        	    for (var i=tmpLineIndex; i<tmpLineIndex+faceCount; i++) {
            		var line = lines[i].trim();
            		var tokens = line.split(' ');

            		var face = new Face(id++);
            		faceList.push(face);

            		var count = tokens[0].trim();

            		for (var j=1; j<count+1; j++) {
            		    var vertexID = tokens[j];
            		    face.vertexList.push(vertexList[vertexID]);
            		}
        	    }

        	    var cx, cy, cz;
        	    cx = 0;
        	    cy = 0;
        	    cz = 0;
        	    for (var i = 0; i < vertexList.length; i++) {
            		cx = Number(cx) + Number(vertexList[i].x);
            		cy = Number(cy) + Number(vertexList[i].y);
            		cz = Number(cz) + Number(vertexList[i].z);
        	    }
        	    cx = cx / vertexList.length;
        	    cy = cy / vertexList.length;
        	    cz = cz / vertexList.length;

        	    //now shift all the points so that cx, cy, cz is at the center
        	    for (var i = 0; i < vertexCount; i++) {
            		vertexList[i].x -= cx;
            		vertexList[i].y -= cy;
            		vertexList[i].z -= cz;
        	    }

    	    //now find the largest value to scale it down
        	    var max = 0;
        	    for (var i = 0; i < vertexCount; i++) {
            		if (Math.abs(vertexList[i].x) > max) {
            		    max = Math.abs(vertexList[i].x);
            		}
            		if (Math.abs(vertexList[i].y) > max) {
            		    max = Math.abs(vertexList[i].y);
            		}
            		if (Math.abs(vertexList[i].z) > max) {
            			max = Math.abs(vertexList[i].z);
            		}
        	    }

        	    //now scale everything, but double max so that everything is between 0.5 and -0.5
        	    max *= 2;
        	    for (var i = 0; i < vertexCount; i++) {
            		vertexList[i].x /= max;
            		vertexList[i].y /= max;
            		vertexList[i].z /= max;
        	    }
        	}
        }
        initBuffers();
    }
    rawFile.send(null);
}
