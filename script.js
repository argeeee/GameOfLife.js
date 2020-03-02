document.addEventListener('DOMContentLoaded', async () => {
    'use strict';
    const screen = document.getElementById('screen');
    const context = screen.getContext('2d');

    const WIDTH = 400, HEIGHT = 200;
    screen.width = WIDTH; screen.height = HEIGHT;

    const CELLSIZE = 8;

    const   ROWS = HEIGHT/CELLSIZE,
            COLS = WIDTH/CELLSIZE;

    let grid = [...Array(ROWS)].map(e => Array(COLS).fill(0));
    // console.table(grid);

    const combinations = await (await fetch('./json/combination.json')).json();
    combinations.forEach(combination => {
        console.log(combination.name);
        set(0, 0, combination.ranges);
    });

    context.strokeStyle = '#ddd';
    context.lineWidth = 1;
    let lastTime = 0.0;

    (function draw(time) {
        const deltaTime = time - lastTime;
        if(deltaTime >= 1000/60.0) {
            // CLEARING
            context.clearRect(0, 0, WIDTH, HEIGHT);

            // UPDATE GRID
            update();
            // DRAW GRID
            for (let y = 0; y < grid.length; y++) {
                for (let x = 0; x < grid[y].length; x++) {

                    context.fillStyle = 
                        grid[y][x] ? '#000' : '#fff';

                    context.fillRect(
                        x*CELLSIZE, y*CELLSIZE,
                        CELLSIZE, CELLSIZE
                    );
                    context.strokeRect(
                        x*CELLSIZE, y*CELLSIZE,
                        CELLSIZE, CELLSIZE
                    );
                }                
            }

            lastTime = time;
        }
        requestAnimationFrame(draw);
    }());

    function update() {        
        let newGrid = [...Array(ROWS)].map(e => Array(COLS).fill(0));
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {

                const   startX = x ? x-1 : x,
                        startY = y ? y-1 : y,
                        endX = (x == COLS-1) ? x : x+1,
                        endY = (y == ROWS-1) ? y : y+1;
                
                // conta quanti vicini ha
                let count = 0;
                for (let j = startY; j <= endY; j++) {
                    for (let i = startX; i <= endX; i++) {
                        if(x == i && y == j) continue;
                        count += grid[j][i];
                    }
                }

                if(grid[y][x] && count < 2)
                    newGrid[y][x] = 0;
                if(grid[y][x] && (count == 2 || count == 3))
                    newGrid[y][x] = 1;
                if(grid[y][x] && count > 3)
                    newGrid[y][x] = 0;
                if(!grid[y][x] && count == 3)
                    newGrid[y][x] = 1;
            }
        }
        grid = newGrid;
    }

    function set(x, y, ranges) {
        ranges.forEach(([startX, startY, w, h]) => {

            startX += x;
            startY += y;
            
            const endX = startX + w, endY = startY + h;

            for (let j = startY; j < endY; j++) {
                for (let i = startX; i < endX; i++) {
                    grid[j][i] = 1;
                }
            }
        });
        // console.table(grid);
    }
});