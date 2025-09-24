let scenesFile = [
    // Template 1: "The Start" - A safe introduction to jumping.
    {
        platforms: [
            { x: 150, y: -200, w: 300, h: 20 },
            
        ],
        coins: [ { x: 150, y: -150 }, { x: 200, y: -150 }, { x: 250, y: -150 }, ],
        spikes: [],
        sceneWidth: 300,
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
        sceneWidth: 1000,
    },

    // // Template 3: "The Spike Bridge" - A long platform requiring careful navigation.
    // {
    //     platforms: [
    //         { x: 400, y: 150, w: 800, h: 20 },
    //         // Safety floor
    //         { x: 400, y: -300, w: 800, h: 20 },
    //     ],
    //     coins: [ { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 }, ],
    //     spikes: [ { x: 450, y: 170 }, { x: 500, y: 170 }, { x: 650, y: 170 }, ],
    //     sceneWidth: 800,
    // },

    // // Template 4: "Tricky Stairs" - Introduces verticality with a hazard.
    // {
    //     platforms: [
    //         { x: 150, y: 50, w: 150, h: 20 },
    //         { x: 350, y: 100, w: 150, h: 20 },
    //         { x: 550, y: 150, w: 150, h: 20 },
    //         { x: 750, y: 200, w: 150, h: 20 },
    //         // Safety floor
    //         { x: 475, y: -300, w: 950, h: 20 },
    //     ],
    //     coins: [ { x: 750, y: 250 }, ],
    //     spikes: [ { x: 550, y: 170 } ],
    //     sceneWidth: 950,
    // },

    // // Template 5: "Bridge Over The Pit" - A narrow path forcing a precise jump.
    // {
    //     ground: -200, 
    //     platforms: [
    //         { x: 500, y: 100, w: 300, h: 20 }, 
    //         // Safety floor below the pit
    //         { x: 500, y: -300, w: 1000, h: 20 },
    //     ],
    //     coins: [ { x: 500, y: 150 } ],
    //     spikes: [ { x: 500, y: 120 } ],
    //     sceneWidth: 1000,
    // },
    
    // // Template 6: "Pillar Gauntlet" - A test of jumping precision.
    // {
    //     ground: -150, 
    //     platforms: [
    //         { x: 100, y: 80, w: 80, h: 20 },
    //         { x: 300, y: 80, w: 80, h: 20 }, 
    //         { x: 500, y: 80, w: 80, h: 20 }, 
    //         { x: 700, y: 80, w: 80, h: 20 }, 
    //         { x: 900, y: 80, w: 80, h: 20 },
    //         // Safety floor below the pit
    //         { x: 550, y: -300, w: 1100, h: 20 },
    //     ],
    //     coins: [ { x: 500, y: 130 } ],
    //     spikes: [ { x: 300, y: 100 }, { x: 700, y: 100 }, ],
    //     sceneWidth: 1100,
    // },

    // // Template 7: "Low Ceiling" - Forces the player to make small, controlled hops.
    // {
    //     platforms: [
    //         { x: 400, y: 20, w: 800, h: 20 },
    //         { x: 400, y: 180, w: 800, h: 20 },
    //         // Safety floor
    //         { x: 400, y: -300, w: 800, h: 20 },
    //     ],
    //     coins: [ { x: 700, y: 70 } ],
    //     spikes: [ { x: 250, y: 40 }, { x: 300, y: 40 }, { x: 500, y: 40 }, ],
    //     sceneWidth: 800,
    // }
];