const fabric = require('fabric').fabric;

const text = new fabric.Text('test', { left: 0, top: 20 });
const rect = new fabric.Rect({ left: -320, top: -37.5, width: 661.89, height: 75, originX: 'left', originY: 'top' });

const group = new fabric.Group([rect, text], { left: 0, top: 20 });

console.log('Group -> left:', group.left, 'top:', group.top);
console.log('Rect  -> left:', rect.left, 'top:', rect.top);
console.log('Text  -> left:', text.left, 'top:', text.top);

// Simuler le align() original:
const padding = 25;
const rectW = rect.width;
const textW = text.getScaledWidth();

// if alignmentX == 'center'
text.set('left', -(textW / 2));
// if alignmentY == 'middle'
text.set('top', -(text.getScaledHeight() / 2));

console.log('After align:');
console.log('Text  -> left:', text.left, 'top:', text.top);
