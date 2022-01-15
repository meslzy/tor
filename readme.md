# Tor (✨)

> Start multiple tor sessions (http and socks)
---

<div align="center">

![stars](https://badgen.net/github/stars/meslzy/tor/)
![forks](https://badgen.net/github/forks/meslzy/tor/)
![issues](https://badgen.net/github/issues/meslzy/tor/)

</div>

---

## Getting Started (✅)

- ### Installation (⏬)
  - `npm i @meslzy/tor --save`

- ### Usage (🎇)
  ```ts
  const tor = new Tor({
    debug: true,
  });
  
  const session = await tor.createSession();
  
  await session.start().catch((err) => {
    console.log(err);
  });
  
  console.log(session.address.http); // 127.0.0.1:5000
  console.log(session.address.socks); // 127.0.0.1:8000
  
  await session.close();
  
  tor.removeSession(session);
  ```

---

## The End (💘)
