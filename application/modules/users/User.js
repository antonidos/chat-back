class User {
    constructor({ id, userName, password, token }) {
        this.id = id;
        this.name = userName;
        this.password = password;
        this.token = token;
    }

    fill({ id, name, password, token}) {
        this.id = id;
        this.name = userName;
        this.password = password;
        this.token = token; 
    }

    clone() {
        return new User({
            id: this.id,
            userName: this.userName,
            password: this.password,
            token: this.token
        });
    }

}

module.exports = User;