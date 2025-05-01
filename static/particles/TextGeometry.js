THREE.TextGeometry = function(text, parameters) {

	parameters = parameters || { };

	const font = parameters.font;

	if (!font || !font.isFont)
	{

		console.error('THREE.TextGeometry: font parameter is not an instance of THREE.Font.');
		return new THREE.BufferGeometry();

	}

	const shapes = font.generateShapes(text, parameters.size);

	parameters.depth = parameters.height !== undefined ? parameters.height : 50;

	// translate parameters to ExtrudeBufferGeometry API

	if (parameters.bevelThickness === undefined) parameters.bevelThickness = 10;
	if (parameters.bevelSize === undefined) parameters.bevelSize = 8;
	if (parameters.bevelEnabled === undefined) parameters.bevelEnabled = false;

	const geometry = new THREE.ExtrudeBufferGeometry(shapes, parameters);

	geometry.parameters.text = text;

	return geometry;

};