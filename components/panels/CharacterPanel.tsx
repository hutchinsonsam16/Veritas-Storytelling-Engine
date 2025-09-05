import React from 'react';
import { useStore } from '../../store';
import { UserCircleIcon } from '../Icons';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionItem } from '../ui/accordion';

export const CharacterPanel = () => {
    const { character, visibility } = useStore(state => ({
        character: state.character,
        visibility: state.settings.componentVisibility
    }));

    const allImages = [character.imageUrl, ...character.imageUrlHistory].filter(Boolean) as string[];

    return (
        <div className="h-full flex flex-col bg-background p-4 overflow-y-auto">
            <Card className="mb-4 border-none shadow-none">
                <CardHeader className="p-0 mb-4">
                     {visibility.characterPortrait && (
                        <>
                            {character.imageUrl ? (
                                <img src={character.imageUrl} alt={character.name} className="w-full h-auto aspect-[3/4] rounded-lg object-cover" />
                            ) : (
                                <div className="w-full aspect-[3/4] rounded-lg bg-secondary flex items-center justify-center">
                                    <UserCircleIcon className="w-24 h-24 text-muted-foreground" />
                                </div>
                            )}
                        </>
                     )}
                     <div className="pt-4">
                         <CardTitle className="text-2xl text-primary">{character.name}</CardTitle>
                         {visibility.characterStatus && (
                            <blockquote className="mt-2 border-l-2 border-primary pl-3">
                                <p className="text-sm text-muted-foreground italic">{character.status || "Ready for action."}</p>
                            </blockquote>
                         )}
                     </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Accordion defaultValue="skills">
                        {visibility.characterSkills && (
                            <AccordionItem value="skills" trigger="Skills">
                                <ul className="space-y-1 text-sm">
                                    {character.skills.length > 0 ? character.skills.map(skill => (
                                        <li key={skill.name} className="flex justify-between items-center">
                                        <span className="text-foreground">{skill.name}</span>
                                        <span className="font-mono text-primary bg-secondary px-2 py-0.5 rounded-md text-xs">{skill.value}</span>
                                        </li>
                                    )) : <li className="text-muted-foreground">No skills defined.</li>}
                                </ul>
                            </AccordionItem>
                        )}
                        
                        {visibility.characterInventory && (
                            <AccordionItem value="inventory" trigger="Inventory">
                                <ul className="space-y-3 text-sm">
                                    {character.inventory.length > 0 ? character.inventory.map(item => (
                                        <li key={item.name}>
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-xs text-muted-foreground pl-2">{item.description}</p>
                                        </li>
                                    )) : <li className="text-muted-foreground">Inventory is empty.</li>}
                                </ul>
                            </AccordionItem>
                        )}

                        {visibility.characterBackstory && (
                            <AccordionItem value="backstory" trigger="Backstory">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{character.backstory}</p>
                            </AccordionItem>
                        )}
                        
                        {visibility.characterProgression && (
                            <AccordionItem value="progression" trigger="Image History">
                                {allImages.length > 1 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {allImages.slice(1, 7).map((url, index) => ( // Show up to 6 previous images
                                            <div key={index} className="relative aspect-w-3 aspect-h-4">
                                                <img src={url} alt={`Character portrait ${index + 1}`} className="rounded-md object-cover w-full h-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No previous character images.</p>
                                )}
                            </AccordionItem>
                        )}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
};