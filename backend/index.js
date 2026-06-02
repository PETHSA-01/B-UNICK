import express from "express" //Se importa el framework EXPRESS
import mysql from "mysql"
import cors from "cors"

const app = express() // Se crea una variable que almacena el objeto express


const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"bunik" 
})

app.use(express.json())
app.use(cors())

app.get("/", (req,res)=> // se crea un metodo get para no mostrar nada en este caso
    {
        res.json("Ya inició esta madre")
    }
)

app.get("/usuarios", (req,res)=> // se crea un metodo get para obtener los valores de la base de datos
{
    const qusuarios = "SELECT * FROM USUARIO" //consulta de usuarios
    db.query(qusuarios, (err0r, info)=>{ // se hace la query 
        if(err0r) return res.json(err0r) //si hay eror, el json va a mostrar el error
        return res.json(info) // si no hay error, el json va a mostrar a los usuarios
    })
}
)

app.get("/usuariosinsercion", (req,res)=>{

    const caracteristicasFisicasusuario = [
        "Redondos",
        "Ovalado",
        "P?lida",
        "Llenos",
        "Celestial",
        "1996-10-10 00:00:00"
    ];

    const qusuarioscaracteristicas = `
    SELECT * 
    FROM CaracteristicasFisicas 
    WHERE Ojos = ? 
    AND Rostro = ? 
    AND Piel = ? 
    AND Boca = ? 
    AND Nariz = ? 
    AND FechaNacimiento = ?
    `;

    db.query(
        qusuarioscaracteristicas,
        caracteristicasFisicasusuario,
        (error, resultados)=>{

            if(error){
                return res.json(error);
            }

            if(resultados.length === 0){
                return res.json({
                    mensaje:"No existen esas características físicas"
                });
            }

            const qusuarios = `INSERT INTO Usuario(Correo,NombreUsuario,Contrasena,CaracteristicasFisicas,FotoPerfil,Descripcion,Verificado,FechaRegistro)VALUES (?,?,?,?,?,?,?,?)`;

            const usuariosvalores = [
                "usermeo1w@bunik.com",
                "Shadowme1owPRUEBA",
                "Shadow123!",
                resultados[0].ID,
                "https://i.pinimg.com/736x/21/74/a6/2174a6a4764b6c2b46ea0107f0ad3d27.jpg",
                "Usuario de prueba. Esta cuenta no es real y fue utilizada durante las pruebas primerizas dentro de la plataforma.",
                1,
                "2026-02-01 10:15:00"
            ];

            const qusuariosexistencia = "Select * from usuario where Correo = ? and NombreUsuario= ? and Contrasena = ? and CaracteristicasFisicas = ? and FotoPerfil = ? and Descripcion =? and Verificado = ? and FechaRegistro = ?"

            db.query(qusuariosexistencia, usuariosvalores, (eror, resultado)=>{
                if(eror) return res.json(eror)
                if(resultado.length > 0) return res.json("Olapapu, eso ya está insertado meow")
                db.query(
                    qusuarios,
                    usuariosvalores,
                    (err0r, info)=>{

                        if(err0r){
                            return res.json(err0r);
                        }

                        return res.json({
                            mensaje:"Insertado correctamente",
                            datos: usuariosvalores
                        });
                    }
                );
            })
                        
        }
    );
});

app.listen(8800, ()=>{ // se selecciona el puerto por el cual el servidor se va a iniciar
        console.log("Conexión backend iniciada");
    }
)// node inde