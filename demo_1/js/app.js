/* ═══════════════════════════════════════════════════════════
   app.js — Main entry point, wires Graph ↔ UI ↔ Dijkstra
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const svg = document.getElementById('graph-svg');

        /* ─── Init Graph ─── */
        Graph.init(svg, {
            onGraphChange: () => {
                UI.refreshNodeSelects();
                UI.validateGraph();
            },
            onNodeClick: handleNodeClick,
            onCanvasClick: handleCanvasClick,
        });

        /* ─── Init UI ─── */
        UI.init();

        /* ─── Load default scenario ─── */
        const defaultScenario = Scenarios.get('simple6');
        if (defaultScenario) {
            Graph.loadGraph(defaultScenario);
            document.getElementById('toggle-directed').checked = defaultScenario.directed;
            document.querySelector('.toggle-track').setAttribute('aria-checked', defaultScenario.directed);
            UI.refreshNodeSelects();
            document.getElementById('start-node').value = defaultScenario.suggestedStart;
            if (defaultScenario.suggestedTarget != null) {
                document.getElementById('target-node').value = defaultScenario.suggestedTarget;
            }
            document.getElementById('scenario-select').value = 'simple6';
        }

        UI.validateGraph();
    });

    /* ═════════════ EVENT HANDLERS ═════════════ */

    function handleNodeClick(nodeId) {
        const mode = UI.getMode();

        if (mode === 'delete') {
            Graph.removeNode(nodeId);
            return;
        }

        if (mode === 'addEdge') {
            const source = UI.getEdgeSourceNode();
            if (source === null) {
                // First click — select source
                UI.setEdgeSourceNode(nodeId);
                Graph.setNodeVisualState(nodeId, 'inqueue'); // visual hint
            } else {
                // Second click — ask for weight
                if (source !== nodeId) {
                    UI.showEdgeDialog(source, nodeId);
                }
                Graph.setNodeVisualState(source, 'unvisited');
                UI.setEdgeSourceNode(null);
            }
            return;
        }

        // select mode — nothing special for now
    }

    function handleCanvasClick({ x, y, target }) {
        const mode = UI.getMode();

        if (mode === 'addNode') {
            Graph.addNode(x, y);
            return;
        }

        if (mode === 'delete') {
            // Check if clicking an edge
            const edgeGroup = target.closest('[data-edge-id]');
            if (edgeGroup) {
                const edgeId = Number(edgeGroup.dataset.edgeId);
                Graph.removeEdge(edgeId);
            }
            return;
        }
    }
})();
