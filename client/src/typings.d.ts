/* SystemJS module definition  */
// Este archivo lo creé yo porque en Angular 10 no aparece por defecto
// La estructura de directorios es diferente, pero el chico del tutorial lo tiene dentro de src

// en teoría este archivo es para poder usar jQuery en angular correctamente

declare var jQuery: any;
declare var $: any;

declare var module: NodeModule;
interface NodeModule  {
  id: string;
}
