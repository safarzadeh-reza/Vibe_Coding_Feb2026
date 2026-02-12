/* ═══════════════════════════════════════════════════════════
   scenarios.js — Built-in graph scenarios
   ═══════════════════════════════════════════════════════════ */

// eslint-disable-next-line no-unused-vars
const Scenarios = (() => {
    'use strict';

    const all = {

        /* ─── 1. Simple 6-Node Example ─── */
        simple6: {
            name: 'Simple 6-Node',
            description: 'A classic introductory graph with 6 nodes. Great for a first walkthrough of Dijkstra.',
            directed: false,
            nodes: [
                { id: 0, label: 'A', x: 120, y: 200 },
                { id: 1, label: 'B', x: 300, y: 80 },
                { id: 2, label: 'C', x: 300, y: 320 },
                { id: 3, label: 'D', x: 500, y: 80 },
                { id: 4, label: 'E', x: 500, y: 320 },
                { id: 5, label: 'F', x: 680, y: 200 },
            ],
            edges: [
                { id: 0, from: 0, to: 1, weight: 4 },
                { id: 1, from: 0, to: 2, weight: 2 },
                { id: 2, from: 1, to: 3, weight: 5 },
                { id: 3, from: 2, to: 4, weight: 3 },
                { id: 4, from: 1, to: 2, weight: 1 },
                { id: 5, from: 3, to: 5, weight: 2 },
                { id: 6, from: 4, to: 5, weight: 6 },
                { id: 7, from: 4, to: 3, weight: 1 },
            ],
            suggestedStart: 0,
            suggestedTarget: 5,
        },

        /* ─── 2. Grid-like Pathfinding ─── */
        grid: {
            name: 'Grid Pathfinding',
            description: 'A 4×3 grid graph resembling a map. Explore shortest paths in a lattice.',
            directed: false,
            nodes: [
                { id: 0, label: 'A1', x: 100, y: 80 },
                { id: 1, label: 'A2', x: 280, y: 80 },
                { id: 2, label: 'A3', x: 460, y: 80 },
                { id: 3, label: 'A4', x: 640, y: 80 },
                { id: 4, label: 'B1', x: 100, y: 220 },
                { id: 5, label: 'B2', x: 280, y: 220 },
                { id: 6, label: 'B3', x: 460, y: 220 },
                { id: 7, label: 'B4', x: 640, y: 220 },
                { id: 8, label: 'C1', x: 100, y: 360 },
                { id: 9, label: 'C2', x: 280, y: 360 },
                { id: 10, label: 'C3', x: 460, y: 360 },
                { id: 11, label: 'C4', x: 640, y: 360 },
            ],
            edges: [
                // Row 1
                { id: 0, from: 0, to: 1, weight: 2 },
                { id: 1, from: 1, to: 2, weight: 3 },
                { id: 2, from: 2, to: 3, weight: 1 },
                // Row 2
                { id: 3, from: 4, to: 5, weight: 1 },
                { id: 4, from: 5, to: 6, weight: 4 },
                { id: 5, from: 6, to: 7, weight: 2 },
                // Row 3
                { id: 6, from: 8, to: 9, weight: 5 },
                { id: 7, from: 9, to: 10, weight: 1 },
                { id: 8, from: 10, to: 11, weight: 3 },
                // Columns
                { id: 9, from: 0, to: 4, weight: 3 },
                { id: 10, from: 1, to: 5, weight: 2 },
                { id: 11, from: 2, to: 6, weight: 1 },
                { id: 12, from: 3, to: 7, weight: 4 },
                { id: 13, from: 4, to: 8, weight: 2 },
                { id: 14, from: 5, to: 9, weight: 3 },
                { id: 15, from: 6, to: 10, weight: 2 },
                { id: 16, from: 7, to: 11, weight: 1 },
            ],
            suggestedStart: 0,
            suggestedTarget: 11,
        },

        /* ─── 3. Disconnected Graph ─── */
        disconnected: {
            name: 'Disconnected Graph',
            description: 'Two separate components. Watch how Dijkstra handles unreachable nodes (dist stays ∞).',
            directed: false,
            nodes: [
                { id: 0, label: 'A', x: 120, y: 160 },
                { id: 1, label: 'B', x: 280, y: 80 },
                { id: 2, label: 'C', x: 280, y: 260 },
                { id: 3, label: 'D', x: 440, y: 160 },
                // Island
                { id: 4, label: 'X', x: 600, y: 120 },
                { id: 5, label: 'Y', x: 700, y: 260 },
                { id: 6, label: 'Z', x: 760, y: 100 },
            ],
            edges: [
                { id: 0, from: 0, to: 1, weight: 3 },
                { id: 1, from: 0, to: 2, weight: 7 },
                { id: 2, from: 1, to: 3, weight: 2 },
                { id: 3, from: 2, to: 3, weight: 1 },
                // Island edges
                { id: 4, from: 4, to: 5, weight: 4 },
                { id: 5, from: 5, to: 6, weight: 2 },
                { id: 6, from: 4, to: 6, weight: 5 },
            ],
            suggestedStart: 0,
            suggestedTarget: null,
        },

        /* ─── 4. Multiple Equal Shortest Paths ─── */
        equalPaths: {
            name: 'Multiple Equal Paths',
            description: 'Several paths from S to T share the same total cost. Observe how Dijkstra picks one.',
            directed: false,
            nodes: [
                { id: 0, label: 'S', x: 100, y: 200 },
                { id: 1, label: 'M1', x: 300, y: 80 },
                { id: 2, label: 'M2', x: 300, y: 200 },
                { id: 3, label: 'M3', x: 300, y: 320 },
                { id: 4, label: 'N1', x: 500, y: 80 },
                { id: 5, label: 'N2', x: 500, y: 320 },
                { id: 6, label: 'T', x: 700, y: 200 },
            ],
            edges: [
                // Path via M1 → N1: 2 + 3 + 2 = 7
                { id: 0, from: 0, to: 1, weight: 2 },
                { id: 1, from: 1, to: 4, weight: 3 },
                { id: 2, from: 4, to: 6, weight: 2 },
                // Path via M2: 3 + 4 = 7
                { id: 3, from: 0, to: 2, weight: 3 },
                { id: 4, from: 2, to: 6, weight: 4 },
                // Path via M3 → N2: 1 + 4 + 2 = 7
                { id: 5, from: 0, to: 3, weight: 1 },
                { id: 6, from: 3, to: 5, weight: 4 },
                { id: 7, from: 5, to: 6, weight: 2 },
                // Cross edges
                { id: 8, from: 1, to: 2, weight: 5 },
                { id: 9, from: 2, to: 3, weight: 6 },
            ],
            suggestedStart: 0,
            suggestedTarget: 6,
        },
    };

    function get(key) { return all[key] || null; }
    function list() { return Object.keys(all).map(k => ({ key: k, name: all[k].name, description: all[k].description })); }

    return { get, list };
})();
