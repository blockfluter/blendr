
const initialState = {
    tools: [
        {
            label: 'Mask Alpha',
            tools: [
                { label: 'Move Layer', shortcut: '1', id: 'move' },
                { label: 'Key Out', shortcut: '2', id: 'key-' },
                { label: 'Key In', shortcut: '3', id: 'key+' },
                { label: 'Paint Out', shortcut: '4', id: 'alpha-' },
                { label: 'Paint In', shortcut: '5', id: 'alpha+' },
                { label: 'Feather Edge', shortcut: '6', id: 'feather' }
            ]
        },
        {
            label: 'Distort',
            tools: [
                { label: 'Move Layer', shortcut: '1', id: 'move' },
                { label: 'Restore', shortcut: '2', id: 'normal' },
                { label: 'Stretch', shortcut: '3', id: 'push' },
                { label: 'Grow', shortcut: '4', id: 'grow' },
                { label: 'Shrink', shortcut: '5', id: 'shrink' },
            ]
        }
    ],
    savedFilename: 'blendr.png',
    imageUrl: 'http://randallwiggins.com/images/sample.jpg'
};

export default initialState;
