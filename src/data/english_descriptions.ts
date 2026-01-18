export const getEnglishDescription = (
    id: number,
    title: string,
    main_information: string,
    building_density?: number,
    people_per_building?: number
): string => {
    // Улучшенные описания для AI поиска
    switch(id) {
        case 1:
            return "Ancient city archaeological site urban settlement historical buildings houses streets architecture population density urban planning residential area";
        case 2:
            return "Fortress castle defensive structure military architecture walls towers protection defense medieval stronghold strategic location high density protected space";
        case 3:
            return "Village rural settlement agricultural community farmhouses countryside fields farming agriculture low density rural life traditional housing";
        case 7:
            return "Large city metropolis urban center high density modern buildings infrastructure transportation commercial residential mixed use high population urban development";
        default:
            // Для других случаев
            const keywords = title.toLowerCase().includes('город') ? 'city urban' :
                           title.toLowerCase().includes('село') ? 'village rural' :
                           title.toLowerCase().includes('крепость') ? 'fortress castle' : '';
            
            return `${title} ${main_information} ${keywords}`.replace(/\s+/g, ' ').trim();
    }
};