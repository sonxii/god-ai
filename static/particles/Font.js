
THREE.Font = function ( data ) {

    this.data = data;
    this.isFont = true;

    this.generateShapes = function ( text, size ) {
        var shapes = [];

        if ( this.data.glyphs === undefined ) {
            console.error( 'THREE.Font: font data does not include "glyphs" property.' );
            return shapes;
        }

        var scale = size / this.data.resolution;
        var lineHeight = ( this.data.boundingBox ? this.data.boundingBox.yMax : 1000 ) * scale;

        var x = 0;
        var y = 0;

        for ( var i = 0; i < text.length; i ++ ) {
            var ch = text.charAt( i );

            if ( ch === '\n' ) {
                x = 0;
                y -= lineHeight;
            } else {
                var glyph = this.data.glyphs[ ch ] || this.data.glyphs[ '?' ];

                if ( ! glyph ) continue;

                if ( glyph.o ) {
                    var path = new THREE.ShapePath();

                    var outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );
                    var outlineLength = outline.length;

                    for ( var j = 0; j < outlineLength; ) {
                        var action = outline[ j ++ ];

                        switch ( action ) {
                            case 'm':
                                path.moveTo( outline[ j ++ ] * scale + x, outline[ j ++ ] * scale + y );
                                break;
                            case 'l':
                                path.lineTo( outline[ j ++ ] * scale + x, outline[ j ++ ] * scale + y );
                                break;
                            case 'q':
                                var cpx = outline[ j ++ ] * scale + x;
                                var cpy = outline[ j ++ ] * scale + y;
                                var cpx1 = outline[ j ++ ] * scale + x;
                                var cpy1 = outline[ j ++ ] * scale + y;
                                path.quadraticCurveTo( cpx1, cpy1, cpx, cpy );
                                break;
                            case 'b':
                                var cpx = outline[ j ++ ] * scale + x;
                                var cpy = outline[ j ++ ] * scale + y;
                                var cpx1 = outline[ j ++ ] * scale + x;
                                var cpy1 = outline[ j ++ ] * scale + y;
                                var cpx2 = outline[ j ++ ] * scale + x;
                                var cpy2 = outline[ j ++ ] * scale + y;
                                path.bezierCurveTo( cpx2, cpy2, cpx1, cpy1, cpx, cpy );
                                break;
                        }
                    }

                    shapes.push.apply( shapes, path.toShapes() );
                }

                x += glyph.ha * scale;
            }
        }

        return shapes;
    };

};
