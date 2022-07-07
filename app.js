const express = require("express");
const app = express();
const PORT = 7632;
const pg = require('pg');
const env = require('dotenv').config().parsed;
const path = require('path');
const bodyParser = require("body-parser");

const cors = require("cors");


// console.log(env);
// console.log(process.env);
// const connectionString =
//   "postgres://naspo:"+process.env.PGPASSWORD +
//   "@naspo-data-warehouse.cecnoxkqhzpt.us-east-2.rds.amazonaws.com:5432/naspo";
// const pgClient = new pg.Client(connectionString);
// const db = pgClient.connect();
async function getdata(){
    const naspodata=[];
    const naspo = await pgClient.query(
        `SELECT "Full Name","Region" FROM warehouse.pbi_registrations_all_events where "EventID" = 'A671ABEA-476E-4623-BC94-5DF7043A582A' and "Status" = 'Accepted'`
      );
        naspo.rows.forEach(row=>{
            // console.log(row);
            naspodata.push(row);
        });
        return naspodata;
}      
let pool;
try{
    pool = new pg.Pool({
        user: 'naspo',
        host: 'naspo-data-warehouse.cecnoxkqhzpt.us-east-2.rds.amazonaws.com',
        database: 'naspo',
        password: process.env.PGPASSWORD,
        port: 5432,
      });
}catch(e){
    console.log(e);
}

app.use(express.static("public"));
app.use(bodyParser.json());

var corsOptions = {
  origin: 'http://localhost:3000',
  credentials:true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.get("/naspo", (request,response)=>{

  response.setHeader(
    "Access-Control-Allow-Origin",
    "http://localhost:3000"
  );
        console.log(request.url);
        pool.query(`SELECT "Full Name","Region" FROM warehouse.pbi_registrations_all_events where "EventID" = 'A671ABEA-476E-4623-BC94-5DF7043A582A' and "Status" = 'Accepted'`).then(res=>{
            response.status(200).json(res.rows);
        }).catch(e=>{
            console.log("hello");
            console.error(e.stack);
        });
        // await pool.end();
});

app.post("/naspo", (request,response)=>{
    // console.log(request);
    // console.log(request.body);
    const ud = request.body.data;
    const name = ud[0];
    const region = ud[1];
    let ticket1 = ud[2];
    let ticket2 = ud[3];
    let ticket3 = ud[4];
    let ticket4 = ud[5];
    let ticket5 = ud[6];
    let ticket6 = ud[7];

    response.setHeader(
      "Access-Control-Allow-Origin",
      "http://localhost:3000"
    );
    
    pool.query(`SELECT * FROM naspo_onsite.user_data WHERE "name"= '${name}' AND "region" = '${region}'`).then(res=>{
      
      if(res.rowCount>0){
        let data = res.rows[0];

        ticket1 = data.ticket1===true ? true: ticket1;
        ticket2 = data.ticket2===true ? true: ticket2;
        ticket3 = data.ticket3===true ? true: ticket3;
        ticket4 = data.ticket4===true ? true: ticket4;
        ticket5 = data.ticket5===true ? true: ticket5;
        ticket6 = data.ticket6===true ? true: ticket6;
        
        pool.query(`UPDATE naspo_onsite.user_data SET ticket1 = '${ticket1}',ticket2 = '${ticket2}',ticket3 = '${ticket3}',ticket4 = '${ticket4}',ticket5 = '${ticket5}',ticket6 = '${ticket6}' WHERE "name"= '${name}' AND "region" = '${region}' `).then(res=>{
          console.log(res);
          response.status(200).send("success");
        }).catch(e=>{
          console.log(e);
        });

      }else{
        pool.query(`insert into naspo_onsite.user_data(name,region,ticket1,ticket2,ticket3,ticket4,ticket5,ticket6) values('${name}','${region}',${ticket1},${ticket2},${ticket3},${ticket4},${ticket5},${ticket6})`).then(res=>{
          console.log(res);
          response.status(200).send("success");
        }).catch(e=>{
          console.log(e);
        });
      }
    }).catch(e=>{
      console.log(e);
    });

})

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname + "/index.html"));
});

app.listen(process.env.PORT || PORT, (error) => {
  if (!error) {
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

// db.then((resolvedata)=>{
//   return resolvedata.json();
// }).then(data=>{
//     console.log(data);
// }).catch(e=>{
//     console.log(e);
// })
// try {
//     pgClient.query(
//       `SELECT "Full Name","Region" FROM warehouse.pbi_registrations_all_events where "EventID" = 'A671ABEA-476E-4623-BC94-5DF7043A582A' and "Status" = 'Accepted'`,
//       (err, res) => {
//         if (err) {
//           console.log(err);
//           response.send(err);
//         } else {
//           // console.log(res);
//           console.log("++++++++++++++++++++++++++++");
//           // console.log(res.rowCount);
//           // console.log(res.rows);
//           res.rows.forEach(row=>{
//               // console.log(row);
//               naspodata.push(row);
//           });
//           response.json({"naspodata":naspodata});
//         }
//         // pgClient.end();
//       }
//     );
//   } catch (e) {
//     console.log(e);
//     response.send(err);
//   }