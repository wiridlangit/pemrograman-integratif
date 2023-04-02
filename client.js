console.log('Welcome to Penginap Kos Database');
console.log('Enter a command (create, read, update, delete, or list)');

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/protos/crud.proto';

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const client = new protoDescriptor.crud.CrudService('localhost:50051', grpc.credentials.createInsecure());

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

process.stdin.on('data', (input) => {
  const command = input.toString().trim();
  switch (command) {
    case 'create':
      console.log('Enter the user\'s name:');
      process.stdin.once('data', (nameInput) => {
        const nama = nameInput.toString().trim();

        console.log('Enter the user\'s nomor telepon:');
        process.stdin.once('data', (telpInput) => {
          const no_telepon = Number(telpInput.toString().trim());

          console.log('Enter the user\'s nomor kos:');
          process.stdin.once('data', (kosInput) => {
            const nomor_kos = kosInput.toString().trim();

            console.log('Enter the user\'s umur:');
          process.stdin.once('data', (ageInput) => {
            const umur = ageInput.toString().trim();

            console.log('Enter the user\'s asal daerah:');
          process.stdin.once('data', (asalInput) => {
            const asal_daerah = asalInput.toString().trim();
            create({ nama, no_telepon, nomor_kos, umur, asal_daerah});
          });
        });
      });
    });
  });
      break;

    case 'read':
      console.log('Enter the ID of the user you want to read:');
      process.stdin.once('data', (idInput) => {
        const id = Number(idInput.toString().trim());
        read(id);
      });
      break;
    case 'update':
      update();
      break;
    case 'delete':
      remove();
      break;
    case 'list':
      ListPenginapKos();
      break;
    default:
      // console.log(`Invalid command: ${command}`);
      break;
  }
});
