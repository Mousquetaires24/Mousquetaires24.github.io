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

const ctx = document.getElementById("canvas").getContext("2d");
const mousquetaireBleu = new Image();
mousquetaireBleu.src = "./mousquetaire_bleu.png";
const mousquetaireBleuFeu = new Image();
mousquetaireBleuFeu.src = "./mousquetaire_bleu_feu.png";
const mousquetaireRouge = new Image();
mousquetaireRouge.src = "./mousquetaire_rouge.png";
const mousquetaireRougeFeu = new Image();
mousquetaireRougeFeu.src = "./mousquetaire_rouge_feu.png";
let pseudo;
let qualification;
let etape = 0;
let temps;
let top;
let numPool;
let numDuel;
let score = 0;
let bestTime = 10000000;
let pseudoAdv;
let pasTemoin;

document.getElementById("dialogco").showModal();

document.getElementById("btnPseudo").addEventListener("click", function () {
  pseudo = document.getElementById("inputPseudo").value;
  update(ref(db, "Users/" + pseudo), {
    pseudo: pseudo,
  });
  document.getElementById("dialogco").close();
  document.getElementById("bienvenue").innerHTML = "Bienvenue " + pseudo + " !";
  ctx.drawImage(mousquetaireBleu, 0, 100, 200, 200);
  ctx.drawImage(mousquetaireRouge, 300, 100, 200, 200);
});

onValue(ref(db, "Admin"), (data) => {
  data = data.val();
  qualification = data.Qualification;
  if (etape != data.Etape) {
    etape = data.Etape;
    if (etape == 1) {
      numDuel = -1;
      pseudoAdv = 0;
      temps = 0;
      ctx.clearRect(0, 0, 500, 500);
      ctx.drawImage(mousquetaireBleu, 0, 100, 200, 200);
      ctx.drawImage(mousquetaireRouge, 300, 100, 200, 200);

      if (qualification == "pool") {
        get(child(ref(db), "Tableau_tournois/Pool")).then((tableauPool) => {
          tableauPool = tableauPool.val();
          for (let i in tableauPool) {
            if (Object.hasOwn(tableauPool[i], pseudo)) {
              numPool = i;
            }
          }
        });
      }

      get(child(ref(db), "Duels")).then((Duels) => {
        Duels = Duels.val();
        for (let i in Duels) {
          if (Object.hasOwn(Duels[i], pseudo)) {
            numDuel = i;
          }
        }
        if (numDuel == -1) {
          pasTemoin = false;
          ctx.strokeText("Vous êtes témoin du duel.", 0, 10);
        } else {
          pasTemoin = true;
          pseudoAdv = Object.keys(Duels[numDuel]);
          pseudoAdv.splice(pseudoAdv.indexOf(pseudo), 1);
          pseudoAdv = pseudoAdv[0];
          ctx.strokeText(pseudoAdv, 350, 90);
        }
      });
    } else if (etape == 2) {
      top = Date.now();
    } else if (etape == 3) {
      get(child(ref(db), "Duels/" + numDuel)).then((result) => {
        result = result.val();
        if (result[pseudo] < result[pseudoAdv]) {
          score += 1;
          ctx.strokeText("Vous avez remporté ce duel !", 0, 10);
          if (qualification == "pool") {
            update(ref(db, "Tableau_tournois/Pool/" + numPool + "/" + pseudo), {
              score: score,
            });
          } else if (qualification == "Quart") {
            let player = new Object();
            player[pseudo] = pseudo;
            update(ref(db, "Tableau_tournois/Demi"), player);
          } else if (qualification == "Demi") {
            let player = new Object();
            player[pseudo] = pseudo;
            update(ref(db, "Tableau_tournois/Final"), player);
          } else if (qualification == "Final") {
            alert("grand gagnant");
          }
        } else {
          ctx.strokeText("Vous avez perdu !", 0, 10);
        }
      });
    }
  }
});

document.getElementById("tirer").addEventListener("click", function () {
  if (etape == 2 && temps == 0 && pasTemoin) {
    temps = Date.now() - top;
    if (temps < bestTime && qualification == "pool") {
      bestTime = temps;
      update(ref(db, "Tableau_tournois/Pool/" + numPool + "/" + pseudo), {
        bestTime: bestTime,
      });
    }
    let tabTime = new Object();
    tabTime[pseudo] = temps;
    update(ref(db, "Duels/" + numDuel), tabTime);
    ctx.clearRect(0, 0, 500, 500);
    ctx.drawImage(mousquetaireBleuFeu, 0, 100, 200, 200);
    ctx.drawImage(mousquetaireRouge, 300, 100, 200, 200);
  }
});
