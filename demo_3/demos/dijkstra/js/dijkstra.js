/* ═══════════════════════════════════════════════════════════
   dijkstra.js — Dijkstra's algorithm engine with step history
   ═══════════════════════════════════════════════════════════ */

// eslint-disable-next-line no-unused-vars
const Dijkstra = (() => {
    'use strict';

    /* ── Pseudocode lines (0-indexed internally) ── */
    const PSEUDOCODE = [
        'function dijkstra(G, source):',
        '  for each vertex v in G:',
        '    dist[v] ← ∞',
        '    prev[v] ← null',
        '  dist[source] ← 0',
        '  PQ.insert(source, 0)',
        '',
        '  while PQ is not empty:',
        '    u ← PQ.extractMin()',
        '    mark u as finalized',
        '',
        '    for each neighbor v of u:',
        '      alt ← dist[u] + weight(u, v)',
        '      if alt < dist[v]:',
        '        dist[v] ← alt',
        '        prev[v] ← u',
        '        PQ.decreaseKey(v, alt)',
        '',
        '  return dist[], prev[]'
    ];

    /* ── Algorithm state ── */
    let dist = {};         // nodeId -> number
    let prev = {};         // nodeId -> nodeId | null
    let finalized = {};    // nodeId -> bool
    let pq = [];           // [{node, dist}]   min-heap by dist
    let history = [];      // array of snapshots for back/step
    let stepIndex = -1;
    let startNode = null;
    let targetNode = null;
    let isRunning = false;
    let isFinished = false;

    /* ═════════════ INIT ═════════════ */
    function init(graphNodes, source, target) {
        dist = {};
        prev = {};
        finalized = {};
        pq = [];
        history = [];
        stepIndex = -1;
        startNode = source;
        targetNode = target != null ? target : null;
        isRunning = true;
        isFinished = false;

        // Init distances
        for (const n of graphNodes) {
            dist[n.id] = Infinity;
            prev[n.id] = null;
            finalized[n.id] = false;
        }
        dist[source] = 0;
        pq.push({ node: source, dist: 0 });

        // Save initial state
        _saveSnapshot({
            type: 'init',
            description: `Initialize: set dist[${_label(source)}] = 0, all others = ∞. Add ${_label(source)} to PQ.`,
            pseudocodeLine: 5,   // PQ.insert(source, 0)
            currentNode: null,
            relaxedEdges: [],
            updatedNodes: [],
        });
    }

    /* ═════════════ STEP FORWARD ═════════════ */
    function step() {
        if (isFinished || !isRunning) return null;

        // If we've already stepped ahead in history (from back), jump forward
        if (stepIndex < history.length - 1) {
            stepIndex++;
            return history[stepIndex];
        }

        // Actual algorithm step
        if (pq.length === 0) {
            isFinished = true;
            _saveSnapshot({
                type: 'done',
                description: 'Algorithm complete — PQ is empty.',
                pseudocodeLine: 18,
                currentNode: null,
                relaxedEdges: [],
                updatedNodes: [],
            });
            return history[stepIndex];
        }

        // Extract min
        pq.sort((a, b) => a.dist - b.dist);
        const { node: u } = pq.shift();

        // Skip if already finalized (stale PQ entry)
        if (finalized[u]) {
            return step(); // recurse to next real step
        }

        finalized[u] = true;

        _saveSnapshot({
            type: 'extract',
            description: `Extract min: ${_label(u)} with dist = ${dist[u]}. Mark as finalized.`,
            pseudocodeLine: 8,
            currentNode: u,
            relaxedEdges: [],
            updatedNodes: [],
        });

        // Early stop if target found
        if (targetNode != null && u === targetNode) {
            isFinished = true;
            _saveSnapshot({
                type: 'target-found',
                description: `Target ${_label(targetNode)} reached! Shortest distance = ${dist[targetNode]}.`,
                pseudocodeLine: 18,
                currentNode: u,
                relaxedEdges: [],
                updatedNodes: [],
                shortestPath: _reconstructPath(targetNode),
            });
            return history[stepIndex];
        }

        // Relax neighbors
        const neighbors = Graph.getNeighbors(u);
        const relaxedEdges = [];
        const updatedNodes = [];

        for (const { node: v, weight, edgeId } of neighbors) {
            if (finalized[v]) continue;
            const alt = dist[u] + weight;
            relaxedEdges.push(edgeId);

            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = u;
                updatedNodes.push(v);
                // Add to PQ (lazy deletion style)
                pq.push({ node: v, dist: alt });
            }
        }

        if (relaxedEdges.length > 0) {
            const updatedDesc = updatedNodes.length > 0
                ? ` Updated: ${updatedNodes.map(n => `${_label(n)}(${dist[n]})`).join(', ')}.`
                : ' No improvements found.';
            _saveSnapshot({
                type: 'relax',
                description: `Relax neighbors of ${_label(u)}.${updatedDesc}`,
                pseudocodeLine: 11,
                currentNode: u,
                relaxedEdges,
                updatedNodes,
            });
        }

        // Check if done
        if (pq.length === 0 || _allFinalized()) {
            isFinished = true;
            const snapshot = {
                type: 'done',
                description: 'Algorithm complete!',
                pseudocodeLine: 18,
                currentNode: null,
                relaxedEdges: [],
                updatedNodes: [],
            };
            if (targetNode != null && dist[targetNode] < Infinity) {
                snapshot.shortestPath = _reconstructPath(targetNode);
            }
            _saveSnapshot(snapshot);
        }

        return history[stepIndex];
    }

    /* ═════════════ STEP BACK ═════════════ */
    function back() {
        if (stepIndex <= 0) return null;
        stepIndex--;
        // Restore state from snapshot
        const snap = history[stepIndex];
        dist = { ...snap.dist };
        prev = { ...snap.prev };
        finalized = { ...snap.finalized };
        pq = snap.pq.map(item => ({ ...item }));
        isFinished = snap.isFinished;
        return snap;
    }

    /* ═════════════ SNAPSHOT ═════════════ */
    function _saveSnapshot(info) {
        stepIndex++;
        // Truncate future history if we branched (shouldn't happen with forward-only, but safe)
        history.length = stepIndex;
        history.push({
            ...info,
            step: stepIndex,
            dist: { ...dist },
            prev: { ...prev },
            finalized: { ...finalized },
            pq: pq.map(item => ({ ...item })),
            isFinished,
        });
    }

    function _allFinalized() {
        return Object.values(finalized).every(Boolean);
    }

    function _reconstructPath(target) {
        const path = [];
        let cur = target;
        while (cur != null) {
            path.unshift(cur);
            cur = prev[cur];
        }
        return path;
    }

    /* ═════════════ HELPERS ═════════════ */
    function _label(nodeId) {
        const n = Graph.getNode(nodeId);
        return n ? n.label : String(nodeId);
    }

    function getCurrentSnapshot() {
        return stepIndex >= 0 ? history[stepIndex] : null;
    }

    function getPseudocode() { return PSEUDOCODE; }
    function getStepIndex() { return stepIndex; }
    function getIsFinished() { return isFinished; }
    function getIsRunning() { return isRunning; }
    function getStartNode() { return startNode; }

    function reset() {
        dist = {}; prev = {}; finalized = {};
        pq = []; history = []; stepIndex = -1;
        startNode = null; targetNode = null;
        isRunning = false; isFinished = false;
    }

    /* ═════════════ EXPOSE ═════════════ */
    return {
        init, step, back, reset,
        getCurrentSnapshot, getPseudocode,
        getStepIndex, getIsFinished, getIsRunning, getStartNode,
    };
})();
