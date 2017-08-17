var DynamicBitmapTextCanvasRenderer = function (renderer, src, interpolationPercentage, camera)
{
    var text = src.text;
    var textLength = text.length;

    if (src.renderMask !== src.renderFlags || textLength === 0 || (src.cameraFilter > 0 && (src.cameraFilter & camera._id)))
    {
        return;
    }
    
    var textureFrame = src.frame;

    var displayCallback = src.displayCallback;

    var cameraScrollX = camera.scrollX * src.scrollFactorX;
    var cameraScrollY = camera.scrollY * src.scrollFactorY;

    var chars = src.fontData.chars;
    var lineHeight = src.fontData.lineHeight;

    var xAdvance = 0;
    var yAdvance = 0;

    var indexCount = 0;
    var charCode = 0;

    var glyph = null;
    var glyphX = 0;
    var glyphY = 0;
    var glyphW = 0;
    var glyphH = 0;

    var x = 0;
    var y = 0;

    var lastGlyph = null;
    var lastCharCode = 0;

    var ctx = renderer.currentContext;
    var image = src.frame.source.image;

    var textureX = textureFrame.cutX;
    var textureY = textureFrame.cutY;

    var rotation = 0;
    var scale = (src.fontSize / src.fontData.size);

    //  Blend Mode
    if (renderer.currentBlendMode !== src.blendMode)
    {
        renderer.currentBlendMode = src.blendMode;
        ctx.globalCompositeOperation = renderer.blendModes[src.blendMode];
    }

    //  Alpha
    if (renderer.currentAlpha !== src.alpha)
    {
        renderer.currentAlpha = src.alpha;
        ctx.globalAlpha = src.alpha;
    }

    //  Smoothing
    if (renderer.currentScaleMode !== src.scaleMode)
    {
        renderer.currentScaleMode = src.scaleMode;
    }

    ctx.save();
    ctx.translate(src.x, src.y);
    ctx.rotate(src.rotation);
    ctx.scale(src.scaleX, src.scaleY);

    if (src.width > 0 && src.height > 0)
    {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, src.width, src.height);
        ctx.clip();
        ctx.closePath();
    }

    for (var index = 0; index < textLength; ++index)
    {
        //  Reset the scale (in case the callback changed it)
        scale = (src.fontSize / src.fontData.size);
        rotation = 0;

        charCode = text.charCodeAt(index);

        if (charCode === 10)
        {
            xAdvance = 0;
            indexCount = 0;
            yAdvance += lineHeight;
            lastGlyph = null;
            continue;
        }

        glyph = chars[charCode];

        if (!glyph)
        {
            continue;
        }

        glyphX = textureX + glyph.x;
        glyphY = textureY + glyph.y;

        glyphW = glyph.width;
        glyphH = glyph.height;

        x = (indexCount + glyph.xOffset + xAdvance) - src.scrollX;
        y = (glyph.yOffset + yAdvance) - src.scrollY;

        //  This could be optimized so that it doesn't even bother drawing it if the x/y is out of range

        if (lastGlyph !== null)
        {
            var kerningOffset = glyph.kerning[lastCharCode];
            x += (kerningOffset !== undefined) ? kerningOffset : 0;
        }

        if (displayCallback)
        {
            var output = displayCallback({ tint: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }, index: index, charCode: charCode, x: x, y: y, scale: scale, rotation: 0, data: glyph.data });

            x = output.x;
            y = output.y;
            scale = output.scale;
            rotation = output.rotation;
        }

        x *= scale;
        y *= scale;

        x -= cameraScrollX;
        y -= cameraScrollY;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // ctx.fillStyle = 'rgba(0,255,0,0.2)';
        // ctx.fillRect(0, 0, glyphW, glyphH);

        ctx.drawImage(image, glyphX, glyphY, glyphW, glyphH, 0, 0, glyphW, glyphH);

        ctx.restore();
        
        xAdvance += glyph.xAdvance;
        indexCount += 1;
        lastGlyph = glyph;
        lastCharCode = charCode;
    }

    if (src.width > 0 && src.height > 0)
    {
        ctx.restore();
    }

    ctx.restore();
};

module.exports = DynamicBitmapTextCanvasRenderer;
