type Mark='food'|'transport'|'shopping'|'fun'|'home'|'study'|'other'|'income'|'adjust'|'bell'|'brush'|'search'|'today'|'assistant'|'settings';
const paths:Record<Mark,string>={
 food:'M4 12 Q11 10 21 12 Q20 21 13 21 Q6 21 4 12 M3 11 Q12 9 22 11 M9 3 Q6 6 10 8 M16 2 Q13 5 17 7',
 transport:'M5 15 L4 8 Q11 5 19 8 L21 15 Z M8 7 L9 3 L17 4 L18 7 M5 12 L20 11 M7 16 L7 19 M18 16 L18 19',
 shopping:'M5 8 Q11 7 19 8 L21 21 Q12 23 3 20 Z M8 9 Q7 1 13 3 Q18 3 17 9',
 fun:'M8 9 Q3 8 3 17 Q3 22 8 17 L16 17 Q23 23 21 14 Q20 7 16 9 Z M6 12 L6 16 M4 14 L9 14 M17 12 L18 13',
 home:'M2 11 L12 3 L23 12 M5 10 L5 21 L20 20 L20 11 M10 21 L10 14 L15 14 L15 20',
 study:'M3 5 Q9 3 12 6 Q18 3 22 5 L21 20 Q16 18 12 21 Q7 18 3 20 Z M12 6 L12 21 M6 8 L9 9 M16 8 L19 7',
 other:'M9 4 L16 3 L15 7 Q23 14 20 20 Q12 24 4 19 Q2 14 10 7 Z M8 8 Q13 10 18 7 M13 12 L13 19 M10 14 L16 14 M10 17 L16 17',
 income:'M5 7 Q12 4 21 7 L20 21 L4 20 Z M8 4 Q13 1 17 4 M12 9 L12 17 M9 12 L12 9 L16 12',
 adjust:'M3 8 Q12 5 21 8 M6 4 L7 12 M3 18 Q11 21 22 18 M17 14 L18 22',
 bell:'M8 6 Q7 2 12 3 Q17 2 17 6 M7 7 L5 19 Q13 22 21 18 L18 6 Z M9 10 L16 9 M10 13 L16 13 M12 21 L13 24 M12 2 L14 0',
 brush:'M4 22 Q4 17 9 16 L20 2 L23 4 L12 18 Q11 24 4 22 Z M10 15 L14 18',
 search:'M17 16 L23 22 M19 10 Q19 19 10 18 Q1 17 3 8 Q5 0 13 3 Q20 4 19 10 Z',
 today:'M4 6 Q13 4 22 6 L21 23 L4 22 Z M8 2 L9 8 M17 2 L17 7 M5 11 Q13 9 21 11 M9 15 L12 14 L12 18 L9 18 Z M16 15 L18 16',
 assistant:'M4 15 Q0 9 6 5 Q13 0 20 6 Q25 12 19 17 Q15 20 9 18 L4 22 L5 16 M8 11 L8 12 M17 10 L17 11 M11 14 Q13 16 15 14',
 settings:'M4 6 Q13 4 22 6 M4 13 Q12 15 22 13 M3 22 Q12 19 22 21 M8 2 L8 10 M18 10 L17 18 M10 17 L11 25',
};
/** Small functional pen marks; illustrations continue to use the existing painted assets. */
export function PaperIcon({kind='other'}:{kind?:Mark}) {
 return <svg className="paper-icon" viewBox="0 0 26 26" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind]}/></svg>;
}
