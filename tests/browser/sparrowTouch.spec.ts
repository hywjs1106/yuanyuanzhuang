import {test,expect} from '@playwright/test';

test('touching the ink bird keeps its transparent background and keyboard focus remains visible',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();
 await page.goto('/');await page.keyboard.press('Escape');await page.getByRole('button',{name:'切换角色风格',exact:true}).click();
 const bird=page.getByRole('button',{name:'让小团雀动一动',exact:true});await expect(bird).toBeVisible();
 const colors=()=>bird.evaluate(el=>{const style=getComputedStyle(el);return {background:style.backgroundColor,tap:style.getPropertyValue('-webkit-tap-highlight-color')};});
 expect(await colors()).toEqual({background:'rgba(0, 0, 0, 0)',tap:'rgba(0, 0, 0, 0)'});
 await bird.tap();await expect(bird).toHaveAttribute('data-animating','true');expect(await colors()).toEqual({background:'rgba(0, 0, 0, 0)',tap:'rgba(0, 0, 0, 0)'});
 // Native touch highlighting is suppressed without removing the keyboard outline.
 await page.keyboard.press('Tab');await bird.focus();expect(await bird.evaluate(el=>el.matches(':focus-visible')&&getComputedStyle(el).outlineStyle!=='none')).toBe(true);
 await context.close();
});
