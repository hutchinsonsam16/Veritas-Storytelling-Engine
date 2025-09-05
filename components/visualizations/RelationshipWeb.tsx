import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { UsersIcon } from '../Icons';

export const RelationshipWeb = () => {
    const { character, world } = useStore(state => ({ character: state.character, world: state.world }));
    const npcs = world.npcs;
    
    const width = 500;
    const height = 400;
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) / 2.5;

    const nodes = useMemo(() => {
        if (npcs.length === 0) return [];
        return npcs.map((npc, index) => {
            const angle = (index / npcs.length) * 2 * Math.PI;
            return {
                ...npc,
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle),
            };
        });
    }, [npcs, center.x, center.y, radius]);

    if (npcs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <UsersIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-4 text-sm">No NPCs have been encountered yet.</p>
            </div>
        )
    }

    const getLineStyle = (relationship: number) => {
        const magnitude = Math.abs(relationship);
        const thickness = Math.max(1, (magnitude / 100) * 4);
        let color = 'hsl(var(--muted-foreground))';
        if (relationship > 10) color = 'hsl(200, 80%, 50%)'; 
        if (relationship < -10) color = 'hsl(var(--destructive))';
        return { stroke: color, strokeWidth: thickness, opacity: 0.7 };
    };

    return (
        <div className="p-4 h-full flex items-center justify-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-2xl mx-auto">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Lines */}
                {nodes.map(npc => (
                    <line key={`line-${npc.id}`} x1={center.x} y1={center.y} x2={npc.x} y2={npc.y} {...getLineStyle(npc.relationship)} />
                ))}

                {/* Player Node (Center) */}
                <g>
                    <circle cx={center.x} cy={center.y} r="30" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="2" style={{filter: 'url(#glow)'}} />
                     <text x={center.x} y={center.y + 4} textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="12" fontWeight="bold" className="pointer-events-none">
                        {character.name}
                    </text>
                </g>

                {/* NPC Nodes */}
                {nodes.map(npc => (
                    <g key={npc.id} className="cursor-pointer group">
                        <circle cx={npc.x} cy={npc.y} r="22" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" className="group-hover:stroke-primary transition-all"/>
                        <text x={npc.x} y={npc.y + 4} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" className="pointer-events-none">
                            {npc.name}
                        </text>
                        <text x={npc.x} y={npc.y + 14} textAnchor="middle" fill={getLineStyle(npc.relationship).stroke} fontSize="9" fontWeight="bold" className="pointer-events-none">
                            ({npc.relationship})
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};
