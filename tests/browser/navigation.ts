import type {Page} from '@playwright/test';

export async function go(page:Page,name:string){
 const nav=page.getByRole('navigation',{name:'功能导航'});
 if(['今日','助手','设置'].includes(name)){await nav.getByRole('button',{name,exact:true}).click();return;}
 await nav.getByRole('button',{name:'今日',exact:true}).click();
 await page.getByRole('button',{name:'打开'+name,exact:true}).click();
}
