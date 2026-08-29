const dns = require("dns");
const mongoose = require("mongoose");

const uri = "mongodb+srv://shahinur-dm_db_user:%23yourself%232023@cluster0.glwlj6v.mongodb.net/school_management?appName=Cluster0";

async function test() {
  console.log("Default DNS test...");
  try {
    const srv = await dns.promises.resolveSrv("_mongodb._tcp.cluster0.glwlj6v.mongodb.net");
    console.log("SRV record found:", srv);
  } catch (e) {
    console.error("Default DNS failed:", e.message);
  }

  console.log("Setting Google DNS (8.8.8.8)...");
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    const srv = await dns.promises.resolveSrv("_mongodb._tcp.cluster0.glwlj6v.mongodb.net");
    console.log("Google DNS SRV success:", srv);
  } catch (e) {
    console.error("Google DNS failed:", e.message);
  }
}

test();
