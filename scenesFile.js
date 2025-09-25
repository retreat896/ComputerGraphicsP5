// Things to Remember
// Y here is properly used where y+ is positive y
// Y=0 is around the center of the screen
// when placing platforms the x is the center of the platform.


let scenesFile = [
    // Template 1: "The Start" - A safe introduction to jumping.
    {
        platforms: [
            { x: 0, y: -200, w: 300, h: 20 },
            
        ],
        coins: [ { x: 0, y: -150 }, { x: 50, y: -150 }, { x: 100, y: -150 }, ],
        spikes: [],
        sceneWidth: 700,
    },

    // Template 2: "Hopping Challenge" - Introduces spikes on platforms.
    {
        platforms: [
            { x: 150, y: -100, w: 200, h: 20 },
            { x: 450, y: 0, w: 200, h: 20 },
            { x: 750, y: 100, w: 200, h: 20 },
            { x: 500, y: -300, w: 500, h: 20 }, 
        ],
        coins: [ { x: 150, y: -50 }, ],
        spikes: [ { x: 450, y: 0 }, { x: 750, y: 100 }, ],
        sceneLength: 1000,
    },

    // Template 3: "The Spike Bridge" - A long platform requiring careful navigation.
    {   
        platforms: [
            { x: 800, y: 100, w: 200, h: 20 },
            { x: 400, y:0, w:100, h:20},
            { x: 0, y:-100, w:100, h:20}
        ],
        coins: [ { x: 750, y: 200 }, { x: 800, y: 220 }, { x: 850, y: 200 }, ],
        spikes: [ { x: 800, y: 100 }, ],
        sceneLength: 1000,
    },

    // Template 4: "Tricky Stairs" - Introduces verticality with a hazard.
    {
        platforms: [
             { x: 0, y: -100, w: 150, h: 20 },
            { x: 300, y: -50, w: 150, h: 20 },
            { x: 600, y: 0, w: 150, h: 20 },
            { x: 900, y: 50, w: 150, h: 20 },
            { x: 1200, y: 100, w: 150, h: 20 },
            { x: 1500, y: 150, w: 150, h: 20 },
            { x: 1800, y: 200, w: 150, h: 20 },
            { x: 2100, y: -200, w: 150, h: 20 },
            // Safety floor
            { x: 2400, y: -150, w: 150, h: 20 },
        ],
        coins: [ { x: 1200, y: 250 }, ],
        spikes: [ { x: 1200, y: 100 } ],
        sceneLength: 2700,
    },

    // Template 5: "Bridge Over The Pit" - A narrow path forcing a precise jump.
    {
        ground: -200, 
        platforms: [
            {x: 0, y: -100, w: 300, h: 20 },
            { x: 500, y: 0, w: 300, h: 20 }, 
            // Safety floor below the pit
            { x: 1000, y: 0, w: 300, h: 20 },
            {x: 1500, y: -100, w: 300, h: 20 }
        ],
        coins: [ { x: 500, y: 150 },{x: 750, y:150} ,{x: 1000, y:150}  ],
        spikes: [ { x: 500, y: 0 }, {x: 1000, y:0} ],
        sceneLength: 1800,
    },
    
    // Template 6: "Pillar Gauntlet" - A test of jumping precision.
    {
        ground: -150, 
        platforms: [
            { x: 100, y: -50, w: 80, h: 20 },
            { x: 300, y: 0, w: 80, h: 20 }, 
            { x: 500, y: 0, w: 80, h: 20 }, 
            { x: 700, y: 0, w: 80, h: 20 }, 
            { x: 900, y: -50, w: 80, h: 20 },
            // Safety floor below the pit

        ],
        coins: [ { x: 500, y: 100 } ],
        spikes: [ { x: 300, y: 0 }, { x: 700, y: 0 }, ],
        sceneLength: 1000,
    },

    // Template 7: "Low Ceiling" - Forces the player to make small, controlled hops.
    {
        platforms: [
            { x: 400, y: 100, w: 800, h: 20 },
            { x: 400, y: -200, w: 800, h: 20 },
        ],
        coins: [ { x: 200, y: -100 },{x:600, y:-100} ],
        spikes: [ { x: 300, y: -200 }, { x: 600, y: -200 }, ],
        sceneLength: 800,
    }
];