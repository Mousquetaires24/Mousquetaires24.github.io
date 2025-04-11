import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  set,
  onValue,
  update,
  get,
  ref,
  getDatabase,
  child,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWYcC8l2lzfktdWBfwo1WxMzBibGHk_98",
  authDomain: "mousquetaires-fc2e4.firebaseapp.com",
  projectId: "mousquetaires-fc2e4",
  storageBucket: "mousquetaires-fc2e4.firebasestorage.app",
  messagingSenderId: "777845012218",
  appId: "1:777845012218:web:9728d21bee7018af567b43",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();

let users = new Array();
let tableauPool = new Array();
let audio = new Audio("./bang.mp3");

document.getElementById("start").addEventListener("click", function () {
  get(child(ref(db), "Users")).then((user) => {
    for (let i in user.val()) {
      users.push(i);
    }
    for (let i = 0; i < 8; i++) {
      tableauPool[i] = new Object();
      for (let u = 0; u < (users.length - (users.length % 8)) / 8; u++) {
        tableauPool[i][
          users[(i * (users.length - (users.length % 8))) / 8 + u]
        ] = { score: 0, bestTime: 100000000 };
      }
    }
    for (let i = 0; i < users.length % 8; i++) {
      tableauPool[i][users[i + (users.length - (users.length % 8))]] = {
        score: 0,
        bestTime: 100000000,
      };
    }
    update(ref(db, "Tableau_tournois"), {
      Pool: tableauPool,
    });
    update(ref(db, "Admin/"), {
      Etape: 0.1,
    });
  });
  console.log("start succesful");
});

document.getElementById("son").addEventListener("click", function () {
  update(ref(db, "Admin/"), {
    Etape: 2,
  });
  audio.play();
  console.log("bang succesful");
});

document.getElementById("resultat").addEventListener("click", function () {
  update(ref(db, "Admin/"), {
    Etape: 3,
  });
  console.log("resultat succesful");
});

document.getElementById("pool1").addEventListener("click", function () {
  let Duels = new Array();
  for (let i in tableauPool) {
    let players = new Object();
    players[Object.keys(tableauPool[i])[0]] = 100000000;
    players[Object.keys(tableauPool[i])[1]] = 100000000;
    Duels.push(players);
  }
  set(ref(db, "Duels"), Duels);
  update(ref(db, "Admin"), {
    Etape: 1,
  });
  console.log("pool1 succesful");
});

document.getElementById("pool2").addEventListener("click", function () {
  let Duels = new Array();
  for (let i in tableauPool) {
    if (Object.keys(tableauPool[i]).length == 3) {
      let players = new Object();
      players[Object.keys(tableauPool[i])[0]] = 100000000;
      players[Object.keys(tableauPool[i])[2]] = 100000000;
      Duels.push(players);
    }
  }
  set(ref(db, "Duels"), Duels);
  update(ref(db, "Admin"), {
    Etape: 1,
  });
  console.log("pool2 succesful");
});

document.getElementById("pool3").addEventListener("click", function () {
  let Duels = new Array();
  for (let i in tableauPool) {
    if (Object.keys(tableauPool[i]).length == 3) {
      let players = new Object();
      players[Object.keys(tableauPool[i])[1]] = 100000000;
      players[Object.keys(tableauPool[i])[2]] = 100000000;
      Duels.push(players);
    }
  }
  set(ref(db, "Duels"), Duels);
  update(ref(db, "Admin"), {
    Etape: 1,
  });
  console.log("pool3 succesful");
});

document.getElementById("quart").addEventListener("click", function () {
  update(ref(db, "Admin"), {
    Qualification: "Quart",
  });
  let tabQuart = new Array();
  get(child(ref(db), "Tableau_tournois/Pool")).then((result) => {
    result = result.val();
    for (let i = 0; i < Object.keys(result).length; i++) {
      let bestTime = [100000, "none"];
      let first = [0, "none"];
      for (let u in result[i]) {
        if (result[i][u]["score"] > first[0]) {
          first[0] = result[i][u]["score"];
          first[1] = u;
        }
        if (result[i][u]["bestTime"] < bestTime[0]) {
          bestTime[0] = result[i][u]["bestTime"];
          bestTime[1] = u;
        }
      }
      if (Object.keys(result[i]).length == 2) {
        tabQuart.push(first[1]);
      } else if (Object.keys(result[i]).length == 3) {
        if (first[0] == 2) {
          tabQuart.push(first[1]);
        } else {
          tabQuart.push(bestTime[1]);
        }
      }
    }
    update(ref(db, "Tableau_tournois"), { Quart: tabQuart });
    let Duels = [{}, {}, {}, {}];
    for (let i in tabQuart) {
      Duels[(i - (i % 2)) / 2][tabQuart[i]] = 100000000;
    }
    set(ref(db, "Duels"), Duels);
    update(ref(db, "Admin"), { Etape: 1 });
    console.log("quart succesful");
  });
});

document.getElementById("demi").addEventListener("click", function () {
  update(ref(db, "Admin"), {
    Qualification: "Demi",
  });
  get(child(ref(db), "Tableau_tournois/Demi")).then((tabDemi) => {
    tabDemi = tabDemi.val();
    let Duels = [{}, {}];
    let index = 0;
    for (let i in tabDemi) {
      Duels[(index - (index % 2)) / 2][i] = 100000000;
      index += 1;
    }
    set(ref(db, "Duels"), Duels);
    update(ref(db, "Admin"), {
      Etape: 1,
    });
    console.log("demi succesful");
  });
});

document.getElementById("final").addEventListener("click", function () {
  update(ref(db, "Admin"), {
    Qualification: "Final",
  });
  get(child(ref(db), "Tableau_tournois/Final")).then((tabFinal) => {
    tabFinal = tabFinal.val();
    let Duels = [{}];
    for (let i in tabFinal) {
      Duels[0][i] = 100000000;
    }
    set(ref(db, "Duels"), Duels);
    update(ref(db, "Admin"), {
      Etape: 1,
    });
    console.log("finale succesful");
  });
});
