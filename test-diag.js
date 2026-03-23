const sql=require('mssql'); 
async function run(){
  await sql.connect({user:'sa',password:'SERVERPIDE',server:'192.168.80.120',database:'ERPHOSPITAL',options:{encrypt:false,trustServerCertificate:true}}); 
  const r=await sql.query("SELECT TOP 5 CODIGO, NOMBRE FROM SITESIS.DIAGNOSTICOS WHERE CODIGO LIKE 'K35%'"); 
  console.log(r.recordset); 
  process.exit();
} 
run();
