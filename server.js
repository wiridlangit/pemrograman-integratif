const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const sqlite3 = require('sqlite3').verbose();

// const db = new sqlite3.Database(':memory:');
const db = new sqlite3.Database('database.db');

const PROTO_PATH = __dirname + '/protos/crud.proto';

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS penginap_kos (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, no_telepon TEXT, nomor_kos INTEGER, umur INTEGER, asal_daerah TEXT)");

  const create = (call, callback) => {
    const { nama, no_telepon, nomor_kos, umur, asal_daerah } = call.request;
    const query = `INSERT INTO penginap_kos (nama, no_telepon, nomor_kos, umur, asal_daerah) VALUES ("${nama}", ${no_telepon}, "${nomor_kos}", "${umur}", "${asal_daerah}")`;
    db.run(query, function(err) {
      if (err) {
        console.error(err);
        callback({ code: grpc.status.INTERNAL, message: err.message });
        return;
      }
      console.log(`User ${nama} has been created with ID: ${this.lastID}`);
      callback(null, { success: true, id: this.lastID || this.changes });
    });
  };

  const read = (call, callback) => {
    const query = `SELECT * FROM penginap_kos WHERE id=${call.request.id}`;
    db.get(query, (err, row) => {
      if (err) {
        callback(err);
      } else if (!row) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: `Penginap Kos dengan id ${call.request.id} tidak ditemukan`
        });
      } else {
        const penginap_kos = {
          id: row.id,
          nama: row.nama,
          no_telepon: row.no_telepon,
          nomor_kos: row.nomor_kos,
          umur: row.umur,
          asal_daerah: row.asal_daerah
        };
        callback(null, { penginap_kos });
      }
    });
  };

  const update = (call, callback) => {
    const { id, nama } = call.request;
    const query = `UPDATE penginap_kos SET nama = '${nama}' WHERE id = ${id}`;
    db.run(query, function(err) {
      if (err) {
        console.error(err);
        callback({ code: grpc.status.INTERNAL, message: err.message });
        return;
      }
      if (this.changes === 0) {
        callback({ code: grpc.status.NOT_FOUND, details: `User with ID ${id} not found` });
        return;
      }
      console.log(`User with ID ${id} has been updated`);
      callback(null, { success: true });
    });
  };

  const remove = (call, callback) => {
    const id = call.request.id;
    const query = `DELETE FROM penginap_kos WHERE id = ${id}`;
    db.run(query, function(err) {
      if (err) {
        console.error(err);
        callback({ code: grpc.status.INTERNAL, message: err.message });
        return;
      }
      if (this.changes === 0) {
        callback({ code: grpc.status.NOT_FOUND, details: `User with ID ${id} not found` });
        return;
      }
      console.log(`User with ID ${id} has been deleted`);
      callback(null, { success: true });
    });
  };

  const ListPenginapKos = (call, callback) => {
    const query = `SELECT * FROM penginap_kos`;
    db.all(query, function(err, rows) {
      if (err) {
        console.error(err);
        callback({ code: grpc.status.INTERNAL, message: err.message });
        return;
      }
      const penginap_kos = rows.map((row) => ({
        id: row.id,
        nama: row.nama,
        no_telepon: row.no_telepon,
        nomor_kos: row.nomor_kos,
        umur: row.umur,
        asal_daerah: row.asal_daerah,
      }));
      callback(null,{ penginap_kos });
    });
  };
    
  server.addService(protoDescriptor.crud.CrudService.service, {
    Create: create,
    Read: read,
    Update: update,
    Remove: remove,
    ListPenginapKos: ListPenginapKos,
  });
    
  server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
  console.log('Server running at http://127.0.0.1:50051');
  server.start();
  
});
