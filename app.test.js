let users = {
    cred: [
        {
            id: 1,
            name: 'helo',
        },
        {
            id: 2,
            name: 'hello',
        },
        {
            id: 3,
            name: 'helllo',
        },
        {
            id: 4,
            name: 'hellllo',
        }
    ]
}
//  ? DELETE METHOD 1
// const a = users.cred.findIndex((e) => e.id == 3);
// users.cred.splice(a, 1);
// console.log(users);
//  ? METHOD 2
users.cred = users.cred.filter((e) => e.id != 1);
console.log(users);