// Test de integridad: verificar que todas las funciones existen en el HTML
const fs = require('fs');

const htmlPath = 'mis flotas/index.html';
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const functionsToCheck = [
  'cargarSistemasDisponiblesEdit',
  'renderSistemasEnEdicion',
  'eliminarSistemaEdit',
  'abrirAgregarSistemas',
  'cerrarAgregarSistemas',
  'agregarSistemaEdit'
];

const modalToCheck = [
  'modal-agregar-sistemas'
];

console.log('🔍 Validando que todas las funciones estén presentes en el HTML...\n');

let allOk = true;

functionsToCheck.forEach(func => {
  if (htmlContent.includes(`function ${func}(`)) {
    console.log(`✅ function ${func}() encontrada`);
  } else {
    console.log(`❌ function ${func}() NO ENCONTRADA`);
    allOk = false;
  }
});

console.log('\n🔍 Validando que las modales estén presentes...\n');

modalToCheck.forEach(modal => {
  if (htmlContent.includes(`id="${modal}"`)) {
    console.log(`✅ Modal "${modal}" encontrada`);
  } else {
    console.log(`❌ Modal "${modal}" NO ENCONTRADA`);
    allOk = false;
  }
});

console.log('\n🔍 Validando referencias...\n');

const references = [
  'window.cruceVehiculoActual',
  'modal-agregar-sistemas',
  'sistemas-disponibles-container',
  'abrirAgregarSistemas()',
];

references.forEach(ref => {
  if (htmlContent.includes(ref)) {
    console.log(`✅ Referencia "${ref}" encontrada`);
  } else {
    console.log(`❌ Referencia "${ref}" NO ENCONTRADA`);
    allOk = false;
  }
});

if (allOk) {
  console.log('\n✅ Todas las validaciones pasaron correctamente');
} else {
  console.log('\n❌ Hay problemas en el código');
  process.exit(1);
}
