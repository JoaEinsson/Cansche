export class DependencyGraph {
    static hasCycle(relationships, newRel) {
        const adj = {};
        for (const rel of relationships) {
            if (!adj[rel.sourceEventId])
                adj[rel.sourceEventId] = [];
            adj[rel.sourceEventId].push(rel.targetEventId);
        }
        if (!adj[newRel.sourceEventId])
            adj[newRel.sourceEventId] = [];
        adj[newRel.sourceEventId].push(newRel.targetEventId);
        const visited = new Set();
        const recStack = new Set();
        function dfs(node) {
            if (recStack.has(node))
                return true;
            if (visited.has(node))
                return false;
            visited.add(node);
            recStack.add(node);
            for (const neighbor of adj[node] || []) {
                if (dfs(neighbor))
                    return true;
            }
            recStack.delete(node);
            return false;
        }
        for (const node of Object.keys(adj)) {
            if (dfs(node))
                return true;
        }
        return false;
    }
    static getDependents(workspace, eventId) {
        const rels = workspace.relationships || [];
        return rels.filter((r) => r.sourceEventId === eventId).map((r) => r.targetEventId);
    }
}
