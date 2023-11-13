function hoyString(){
    const date = new Date();    
    const date_ms = date.getTime();
    const dateNew = new Date(date_ms - (3*60*60000));
    console.log('hoyString',dateNew.toISOString());
    return dateNew
            .toISOString()
            .slice(0,10)
}

function hoyString2(){
    let hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    hoy = new Date(hoy.getTime() - (offset*60*1000));
    console.log('hoyString2',hoy.toISOString());
    return hoy.toISOString().split('T')[0];
}

it('Verificar fechas con huso horario como cadenas en formato ISO',()=>{
    const fecha1 = hoyString();    
    const fecha2 = hoyString2();
    console.log('fecha1',fecha1);
    console.log('fecha2',fecha2);        
    expect(fecha1).toBe(fecha2);    
})