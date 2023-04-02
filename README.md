# Pemrograman Integratif
# gRPC API and Protobuf Node.JS

# Description
Projek gRPC CRUD ini akan create, read, update, delete, dan list database penginap kos.

## Langkah Pengerjaan
1. Buat folder projek.
2. Buat file javascript bernama server.js dan client.js.
3. Buat folder protos dalam folder projek.
4. Buat file Protobuf crud.proto dalam folder protos.
5. Kembali ke folder soal3 lalu jalankan terminal dari folder tersebut.

## Instalasi Node Modules
1. Silahkan kunjungi situs https://nodejs.org/ dan download versi terbaru dari Node.js, kemudian ikuti prosedur instalasi sampai selesai. 
2. Masukan command dibawah pada terminal

```npm init -y```

```npm install grpc grpc-tools protobufjs @grpc/proto-loader pg```

## Proto file
```
service CrudService {
  rpc Create(CreateRequest) returns (CreateResponse) {}
  rpc Read(ReadRequest) returns (ReadResponse) {}
  rpc Update(UpdateRequest) returns (UpdateResponse) {}
  rpc Remove(RemoveRequest) returns (RemoveResponse) {}
  rpc ListPenginapKos(ListPenginapKosRequest) returns (ListPenginapKosResponse) {}
}
```


## Server
CRUD and list function in server
```
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
    const id = call.request.id;
    const query = `SELECT * FROM penginap_kos WHERE id = ${id}`;
    db.get(query, function(err, row) {
      if (err) {
        console.error(err);
        callback({ code: grpc.status.INTERNAL, message: err.message });
        return;
      }
      if (!row) {
        callback({ code: grpc.status.NOT_FOUND, details: `User with ID ${id} not found` });
        return;
      }
      const user = {
        id: row.id,
        nama: row.nama,
        no_telepon: row.no_telepon,
        nomor_kos: row.nomor_kos,
        umur: row.umur,
        asal_daerah: row.asal_daerah,
      };
      callback(null, { user });
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
  ```

## client
CRUD and list function in client.js
```
const create = ({  nama, no_telepon, nomor_kos, umur, asal_daerah }) => {
  client.Create({  nama, no_telepon, nomor_kos, umur, asal_daerah }, (err, response) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`User ${nama} has been created with ID: ${response.id}`);
    }
  });
};

const read = (id) => {
  client.Read({ id }, (err, response) => {
    if (err) {
      if (err.code === grpc.status.NOT_FOUND) {
        console.error(`User with ID ${id} not found`);
      } else {
        console.error(err);
      }
    } else {
      const penginap_kos = response.penginap_kos;
      console.log(`User with ID ${penginap_kos.id}:`);
      console.log(`Nama: ${penginap_kos.nama}`);
      console.log(`No. Telp: ${penginap_kos.no_telepon}`);
      console.log(`No. Kos: ${penginap_kos.nomor_kos}`);
      console.log(`Umur: ${penginap_kos.umur}`);
      console.log(`Asal Daerah: ${penginap_kos.asal_daerah}`);
    }
  });
};


const update = () => {
  console.log('Enter the ID of the user you want to update:');
  process.stdin.once('data', (idInput) => {
    const id = Number(idInput.toString().trim());

    console.log(`Enter the updated name for user with ID ${id}:`);
    process.stdin.once('data', (nameInput) => {
      const nama = nameInput.toString().trim();

      console.log(`Enter the updated no_telepon for user with ID ${id}:`);
      process.stdin.once('data', (telpInput) => {
        const no_telepon = Number(telpInput.toString().trim());

        console.log(`Enter the updated nomor_kos for user with ID ${id}:`);
        process.stdin.once('data', (kosInput) => {
          const nomor_kos = kosInput.toString().trim();

          console.log(`Enter the updated umur for user with ID ${id}:`);
          process.stdin.once('data', (ageInput) => {
            const umur = ageInput.toString().trim();

            console.log(`Enter the updated asal_daerah for user with ID ${id}:`);
            process.stdin.once('data', (asalInput) => {
              const asal_daerah = asalInput.toString().trim();
              client.Update({id, nama, no_telepon, nomor_kos, umur, asal_daerah}, (err, response) => {
                if (err) {
                  console.error(`Update error: User with ID ${id} not found`);
                } else {
                  console.log(`User with ID ${id} has been updated`);
                }
              });
            });
          });
        });
      });
    });
  });
};


const remove = () => {
  console.log('Enter the ID of the user you want to delete:');
  process.stdin.once('data', (idInput) => {
    const id = Number(idInput.toString().trim());
    client.Remove({ id }, (err, response) => {
      if (err) {
        console.error(`Delete error: User with ID ${id} not found`);
      } else {
        console.log(`User with ID ${id} has been deleted`);
      }
    });
  });
};

const ListPenginapKos = () => {
  client.ListPenginapKos({}, (err, response) => {
    if (err) {
      console.error(err);
    } else if (!response.hasOwnProperty('penginap_kos')) {
      console.error('Invalid response: no penginap kos property found');
    } else {
      const penginap_kos = response.penginap_kos;
      console.log(`${penginap_kos.length} penginap kos:`);
      penginap_kos.forEach((penginap_kos) => {
        console.log(`User with ID ${penginap_kos.id}:`);
        console.log(`Name: ${penginap_kos.nama}`);
        console.log(`No. Telepon: ${penginap_kos.no_telepon}`);
        console.log(`Nomor Kos: ${penginap_kos.nomor_kos}`);
        console.log(`Umur: ${penginap_kos.umur}`);
        console.log(`Asal Daerah: ${penginap_kos.asal_daerah}`);
      });
    }
  });
};
```


## Testing
1. Type
```node server.js``` then in another terminal type ```node client.js```

2. Type "create" to create data.
![Create](https://raw.githubusercontent.com/wiridlangit/pemrograman-integratif/main/img/Screenshot%202023-04-02%20155607.png)

3. Type "read" to read specific data.
![Update](https://raw.githubusercontent.com/wiridlangit/pemrograman-integratif/main/img/Screenshot%202023-04-02%20172945.png)

4. Type "update" to update data.
![Update](https://raw.githubusercontent.com/wiridlangit/pemrograman-integratif/main/img/Screenshot%202023-04-02%20155957.png)

5. Type "delete" to delete data.
![Update](https://github.com/wiridlangit/pemrograman-integratif/blob/main/img/Screenshot%202023-04-02%20172913.png?raw=true)

6. Type "list" to see all data.
![Output](https://raw.githubusercontent.com/wiridlangit/pemrograman-integratif/main/img/Screenshot%202023-04-02%20160036.png)


## Authors

- [@wiridlangit](https://www.github.com/wiridlangit)
