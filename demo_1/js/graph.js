/* ═══════════════════════════════════════════════════════════
   graph.js — Graph data model + SVG rendering
   ═══════════════════════════════════════════════════════════ */

// eslint-disable-next-line no-unused-vars
const Graph = (() => {
    'use strict';

    /* ── State ── */
    let nodes = [];       // { id, label, x, y }
    let edges = [];       // { id, from, to, weight }
    let directed = false;
    let nextNodeId = 0;
    let nextEdgeId = 0;

    /* ── SVG refs ── */
    let svg = null;
    let edgeGroup = null;
    let nodeGroup = null;
    let defs = null;

    /* ── Callbacks ── */
    let onGraphChange = null;       // called when graph topology changes
    let onNodeClick = null;         // called with nodeId
    let onCanvasClick = null;       // called with {x,y}
    let onEdgeRequest = null;       // called with {from,to} to ask UI for weight

    /* ── Drag state ── */
    let dragNode = null;
    let dragOffset = { x: 0, y: 0 };

    /* ═════════════ INIT ═════════════ */
    function init(svgEl, callbacks = {}) {
        svg = svgEl;
        onGraphChange = callbacks.onGraphChange || (() => { });
        onNodeClick = callbacks.onNodeClick || (() => { });
        onCanvasClick = callbacks.onCanvasClick || (() => { });
        onEdgeRequest = callbacks.onEdgeRequest || (() => { });

        // Create SVG groups
        defs = _svgEl('defs');
        edgeGroup = _svgEl('g', { 'data-layer': 'edges' });
        nodeGroup = _svgEl('g', { 'data-layer': 'nodes' });
        svg.appendChild(defs);
        svg.appendChild(edgeGroup);
        svg.appendChild(nodeGroup);

        _addArrowMarker('arrow-default', 'arrow-fill-default');
        _addArrowMarker('arrow-relax', 'arrow-fill-relax');
        _addArrowMarker('arrow-path', 'arrow-fill-path');

        // Canvas click
        svg.addEventListener('pointerdown', _onSvgPointerDown);
        svg.addEventListener('pointermove', _onSvgPointerMove);
        svg.addEventListener('pointerup', _onSvgPointerUp);
    }

    /* ═════════════ ARROW MARKERS ═════════════ */
    function _addArrowMarker(id, cssClass) {
        const marker = _svgEl('marker', {
            id, viewBox: '0 0 10 10', refX: '28', refY: '5',
            markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse'
        });
        const path = _svgEl('path', { d: 'M0,0 L10,5 L0,10 Z', class: cssClass });
        marker.appendChild(path);
        defs.appendChild(marker);
    }

    /* ═════════════ PUBLIC API ═════════════ */
    function addNode(x, y, label) {
        const id = nextNodeId++;
        label = label || String.fromCharCode(65 + (id % 26)) + (id >= 26 ? Math.floor(id / 26) : '');
        nodes.push({ id, label, x, y });
        _renderNode(nodes[nodes.length - 1]);
        onGraphChange();
        return id;
    }

    function removeNode(id) {
        edges = edges.filter(e => e.from !== id && e.to !== id);
        nodes = nodes.filter(n => n.id !== id);
        _fullRender();
        onGraphChange();
    }

    function addEdge(from, to, weight) {
        if (from === to) return null;
        // prevent duplicate
        const dup = edges.find(e => e.from === from && e.to === to);
        if (dup) return null;
        if (!directed) {
            const dup2 = edges.find(e => e.from === to && e.to === from);
            if (dup2) return null;
        }
        const id = nextEdgeId++;
        edges.push({ id, from, to, weight: Number(weight) });
        _fullRender();
        onGraphChange();
        return id;
    }

    function removeEdge(id) {
        edges = edges.filter(e => e.id !== id);
        _fullRender();
        onGraphChange();
    }

    function setDirected(val) {
        directed = !!val;
        _fullRender();
        onGraphChange();
    }

    function isDirected() { return directed; }

    function getNodes() { return nodes.slice(); }
    function getEdges() { return edges.slice(); }
    function getNode(id) { return nodes.find(n => n.id === id) || null; }

    function getNeighbors(nodeId) {
        const result = [];
        for (const e of edges) {
            if (e.from === nodeId) result.push({ node: e.to, weight: e.weight, edgeId: e.id });
            if (!directed && e.to === nodeId) result.push({ node: e.from, weight: e.weight, edgeId: e.id });
        }
        return result;
    }

    function hasNegativeWeights() {
        return edges.some(e => e.weight < 0);
    }

    function clear() {
        nodes = []; edges = [];
        nextNodeId = 0; nextEdgeId = 0;
        _fullRender();
        onGraphChange();
    }

    function loadGraph(data) {
        nodes = data.nodes.map(n => ({ ...n }));
        edges = data.edges.map(e => ({ ...e }));
        directed = !!data.directed;
        nextNodeId = Math.max(0, ...nodes.map(n => n.id)) + 1;
        nextEdgeId = Math.max(0, ...edges.map(e => e.id)) + 1;
        _fullRender();
        onGraphChange();
    }

    /* ═════════════ VISUAL STATE (called by algorithm) ═════════════ */
    function setNodeVisualState(nodeId, state) {
        const circle = svg.querySelector(`[data-node-id="${nodeId}"] .node-circle`);
        if (!circle) return;
        // Remove old states
        circle.classList.remove('unvisited', 'inqueue', 'current', 'finalized', 'updated', 'on-path');
        if (state) circle.classList.add(state);
        // Ripple on "current"
        if (state === 'current') {
            _addRipple(nodeId);
        }
    }

    function setNodeDistLabel(nodeId, dist) {
        const el = svg.querySelector(`[data-node-id="${nodeId}"] .node-dist-label`);
        if (el) el.textContent = dist === Infinity ? '∞' : dist;
    }

    function setEdgeVisualState(edgeId, state) {
        const line = svg.querySelector(`[data-edge-id="${edgeId}"] .edge-line`);
        const arrow = svg.querySelector(`[data-edge-id="${edgeId}"] .edge-arrow`);
        if (line) {
            line.classList.remove('relaxing', 'on-path');
            if (state) line.classList.add(state);
            // Update marker
            if (directed) {
                if (state === 'relaxing') line.setAttribute('marker-end', 'url(#arrow-relax)');
                else if (state === 'on-path') line.setAttribute('marker-end', 'url(#arrow-path)');
                else line.setAttribute('marker-end', 'url(#arrow-default)');
            }
        }
        if (arrow) {
            arrow.classList.remove('relaxing', 'on-path');
            if (state) arrow.classList.add(state);
        }
    }

    function clearAllVisualStates() {
        svg.querySelectorAll('.node-circle').forEach(c => {
            c.classList.remove('unvisited', 'inqueue', 'current', 'finalized', 'updated', 'on-path');
        });
        svg.querySelectorAll('.edge-line').forEach(l => {
            l.classList.remove('relaxing', 'on-path');
            if (directed) l.setAttribute('marker-end', 'url(#arrow-default)');
        });
        svg.querySelectorAll('.edge-arrow').forEach(a => {
            a.classList.remove('relaxing', 'on-path');
        });
        svg.querySelectorAll('.node-dist-label').forEach(el => { el.textContent = ''; });
        svg.querySelectorAll('.node-ripple').forEach(r => r.remove());
    }

    /* ═════════════ RENDERING ═════════════ */
    function _fullRender() {
        edgeGroup.innerHTML = '';
        nodeGroup.innerHTML = '';
        edges.forEach(_renderEdge);
        nodes.forEach(_renderNode);
    }

    function _renderNode(node) {
        const g = _svgEl('g', { 'data-node-id': node.id, class: 'node-group', transform: `translate(${node.x},${node.y})` });

        const circle = _svgEl('circle', { class: 'node-circle pop-in', r: 22 });
        const label = _svgEl('text', { class: 'node-label', dy: '0' });
        label.textContent = node.label;

        const distLabel = _svgEl('text', { class: 'node-dist-label', dy: '-30' });

        g.appendChild(circle);
        g.appendChild(label);
        g.appendChild(distLabel);

        // Event listeners
        g.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            _startDrag(node, e);
        });

        g.addEventListener('click', (e) => {
            e.stopPropagation();
            onNodeClick(node.id);
        });

        nodeGroup.appendChild(g);
    }

    function _renderEdge(edge) {
        const fromNode = getNode(edge.from);
        const toNode = getNode(edge.to);
        if (!fromNode || !toNode) return;

        const g = _svgEl('g', { 'data-edge-id': edge.id });

        // Compute offset for bi‐directional edges
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        // perpendicular offset for parallel edges
        const hasBothDir = directed && edges.some(e => e.from === edge.to && e.to === edge.from);
        const perpOff = hasBothDir ? 8 : 0;
        const px = (-dy / len) * perpOff;
        const py = (dx / len) * perpOff;

        const x1 = fromNode.x + px;
        const y1 = fromNode.y + py;
        const x2 = toNode.x + px;
        const y2 = toNode.y + py;

        // Invisible wider line for easier clicking
        const hoverLine = _svgEl('line', {
            x1, y1, x2, y2, class: 'edge-hover-zone'
        });
        hoverLine.addEventListener('click', (e) => {
            e.stopPropagation();
            // Placeholder for edge click (delete mode handled elsewhere)
        });

        const line = _svgEl('line', {
            x1, y1, x2, y2,
            class: 'edge-line',
            'marker-end': directed ? 'url(#arrow-default)' : ''
        });

        // Weight label
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const labelOff = perpOff ? 0 : 12;
        const lx = mx + (-dy / len) * labelOff;
        const ly = my + (dx / len) * labelOff;
        const wLabel = _svgEl('text', { x: lx, y: ly, class: 'edge-weight-label' });
        wLabel.textContent = edge.weight;

        g.appendChild(hoverLine);
        g.appendChild(line);
        g.appendChild(wLabel);
        g.dataset.edgeId = edge.id;
        g.dataset.from = edge.from;
        g.dataset.to = edge.to;
        edgeGroup.appendChild(g);
    }

    /* ═════════════ DRAG ═════════════ */
    function _startDrag(node, e) {
        const pt = _svgPoint(e);
        dragNode = node;
        dragOffset.x = pt.x - node.x;
        dragOffset.y = pt.y - node.y;
        svg.style.cursor = 'grabbing';
    }

    function _onSvgPointerDown(e) {
        if (e.target === svg || e.target.closest('[data-layer]') === edgeGroup) {
            // Canvas click (not on node)
            const pt = _svgPoint(e);
            onCanvasClick({ x: pt.x, y: pt.y, target: e.target });
        }
    }

    function _onSvgPointerMove(e) {
        if (!dragNode) return;
        const pt = _svgPoint(e);
        dragNode.x = pt.x - dragOffset.x;
        dragNode.y = pt.y - dragOffset.y;
        _updateNodePosition(dragNode);
        _updateEdgesForNode(dragNode.id);
    }

    function _onSvgPointerUp() {
        if (dragNode) {
            dragNode = null;
            svg.style.cursor = '';
        }
    }

    function _updateNodePosition(node) {
        const g = svg.querySelector(`[data-node-id="${node.id}"]`);
        if (g) g.setAttribute('transform', `translate(${node.x},${node.y})`);
    }

    function _updateEdgesForNode(nodeId) {
        edges.forEach(edge => {
            if (edge.from !== nodeId && edge.to !== nodeId) return;
            const fromN = getNode(edge.from);
            const toN = getNode(edge.to);
            if (!fromN || !toN) return;
            const g = svg.querySelector(`[data-edge-id="${edge.id}"]`);
            if (!g) return;

            const dx = toN.x - fromN.x;
            const dy = toN.y - fromN.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const hasBothDir = directed && edges.some(e => e.from === edge.to && e.to === edge.from);
            const perpOff = hasBothDir ? 8 : 0;
            const px = (-dy / len) * perpOff;
            const py = (dx / len) * perpOff;

            const x1 = fromN.x + px;
            const y1 = fromN.y + py;
            const x2 = toN.x + px;
            const y2 = toN.y + py;

            const lines = g.querySelectorAll('line');
            lines.forEach(l => {
                l.setAttribute('x1', x1); l.setAttribute('y1', y1);
                l.setAttribute('x2', x2); l.setAttribute('y2', y2);
            });

            const wLabel = g.querySelector('.edge-weight-label');
            if (wLabel) {
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                const labelOff = perpOff ? 0 : 12;
                wLabel.setAttribute('x', mx + (-dy / len) * labelOff);
                wLabel.setAttribute('y', my + (dx / len) * labelOff);
            }
        });
    }

    /* ═════════════ RIPPLE ═════════════ */
    function _addRipple(nodeId) {
        const node = getNode(nodeId);
        if (!node) return;
        const g = svg.querySelector(`[data-node-id="${nodeId}"]`);
        if (!g) return;
        const ripple = _svgEl('circle', { cx: 0, cy: 0, r: 22, class: 'node-ripple' });
        g.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    /* ═════════════ SVG HELPERS ═════════════ */
    function _svgEl(tag, attrs = {}) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [k, v] of Object.entries(attrs)) {
            el.setAttribute(k, v);
        }
        return el;
    }

    function _svgPoint(e) {
        const rect = svg.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    /* ═════════════ EXPOSE ═════════════ */
    return {
        init, addNode, removeNode, addEdge, removeEdge,
        setDirected, isDirected,
        getNodes, getEdges, getNode, getNeighbors,
        hasNegativeWeights, clear, loadGraph,
        setNodeVisualState, setNodeDistLabel, setEdgeVisualState, clearAllVisualStates,
        _fullRender
    };
})();
