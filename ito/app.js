import {drawNumber} from './deck.mjs';

const button = document.querySelector('#start');
const card = document.querySelector('#number');
const status = document.querySelector('#status');
const remaining = document.querySelector('#remaining');
let session = null;
let busy = false;
let connectionVersion = 0;
let draw;

function render() {
  button.disabled = !session || busy;
  button.textContent = busy ? '配布中…' : session?.number ? '別の数字を引く' : '開始';
  card.textContent = session?.number || '—';
}

button.addEventListener('click', async () => {
  if (!session || busy) return;
  const current = session;
  busy = true;
  status.textContent = '数字を配っています…';
  render();
  try {
    const result = await draw(current.id);
    if (session !== current) return;
    if (!result.committed) {
      status.textContent = '今は空いている数字がありません。少し待ってから、もう一度お試しください。';
      return;
    }
    current.number = result.snapshot.child(current.id + '/number').val();
    status.textContent = 'あなたの数字です。他の人には見せずに遊びましょう。';
  } catch {
    if (session === current) status.textContent = '数字を配れませんでした。接続やFirebaseの設定を確認して、もう一度お試しください。';
  } finally {
    busy = false;
    render();
  }
});

async function connect() {
  try {
    const {initializeApp} = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
    const {getDatabase, ref, push, set, remove, onValue, onDisconnect, runTransaction} =
      await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js');
    const db = getDatabase(initializeApp({
      apiKey: 'AIzaSyCaLCM4TXURROKyDKD_Mga8ZnWr1-Wk9Wg',
      authDomain: 'database-s-9e4b3.firebaseapp.com',
      databaseURL: 'https://database-s-9e4b3-default-rtdb.asia-southeast1.firebasedatabase.app',
      projectId: 'database-s-9e4b3',
      appId: '1:13648984683:web:c782d2963c253df69b8f2e'
    }));
    const playersRef = ref(db, 'ito/players');
    draw = id => runTransaction(playersRef, players => drawNumber(players, id), {applyLocally: false});
    onValue(playersRef, snapshot => {
      const players = snapshot.val() || {};
      const count = Object.values(players).filter(player => player.number >= 1 && player.number <= 100).length;
      remaining.textContent = `残り ${100 - count} / 100 枚`;
    }, () => {
      status.textContent = '接続できません。Firebaseのito用ルールを確認してください。';
    });
    onValue(ref(db, '.info/connected'), async snapshot => {
      const version = ++connectionVersion;
      session = null;
      render();
      if (!snapshot.val()) {
        status.textContent = '接続待ちです。切断後は数字を返却し、再接続したら引き直します。';
        remaining.textContent = '接続待ち';
        return;
      }
      status.textContent = '配布の準備をしています…';
      const ownRef = push(playersRef);
      try {
        // Register server-side cleanup before making this connection visible.
        await onDisconnect(ownRef).remove();
        if (version !== connectionVersion) return;
        await set(ownRef, {number: 0});
        if (version !== connectionVersion) {
          await remove(ownRef);
          return;
        }
        session = {id: ownRef.key, number: 0};
        status.textContent = '「開始」を押すと、あなたの数字が配られます。';
        render();
      } catch {
        if (version !== connectionVersion) return;
        session = null;
        status.textContent = '配布の準備ができません。通信状態とFirebaseのito用ルールを確認してください。';
        render();
      }
    });
  } catch {
    status.textContent = '接続できませんでした。通信状態を確認してページを再読み込みしてください。';
  }
}

render();
connect();
