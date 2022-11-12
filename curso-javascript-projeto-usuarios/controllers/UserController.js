class UserController{

    constructor(createFormId, updateFormId, tableId){

        this.createFormEl = document.getElementById(createFormId);
        this.updateFormEl = document.getElementById(updateFormId);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }
    getValues(formEl){

        let user = {};
        let isValid = true;
        
        // getting form input elements
        // ... é p SpreadOperator
        [...formEl.elements].forEach((idx, val) => {

            if(['name', 'email', 'password'].indexOf(idx.name) > -1 && !idx.value){

                idx.parentElement.classList.add('has-error');
                isValid = false;
            }

            if(idx.name == "gender"){
                if(idx.checked){
                    user[idx.name] = idx.value
                }
            }else if(idx.name == 'admin'){

                user[idx.name] = idx.checked;
            }
            else{
                user[idx.name] = idx.value
            }
        });

        if(!isValid){
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
    }
    // ADICIONA UMA NOVA LINHA NA TABELA
    addLine(userData){

        let tr = this.getTr(userData);

        this.tableEl.appendChild(tr);

        this.updateUsersCount();
    }
    getTr(userData, tr = null){

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(userData);

        tr.innerHTML = `
        <tr>
            <td><img src="${userData.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${userData.name}</td>
            <td>${userData.email}</td>
            <td>${userData.admin ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(userData.register)}</td>
            <td>
            <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
            </td>
        </tr>
        `;

        this.addTrEvents(tr);

        return tr;

    }
    onSubmit(){

        this.createFormEl.addEventListener("submit", e =>{
    
            e.preventDefault();

            let btn = this.createFormEl.querySelector("[type=submit]");
            btn.disabled = true;
            
            let values = this.getValues(this.createFormEl);
            
            if(!values) return false;

            values.photo = "";
            
            // utilizando a promisse
            this.getPhoto(this.createFormEl).then((content) =>{
                
                values.photo = content;

                values.save();

                this.addLine(values);

                this.createFormEl.reset();

                btn.disabled = false;

            }), (e) =>{
                console.error(e);
            }
        });
    }    
    getPhoto(formEl){

        return new Promise((resolve, reject) =>{

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item =>{
                if(item.name === 'photo'){
                    return item;
                }
            });
    
            let file = elements[0].files[0];
    
            fileReader.onload = () =>{
    
                resolve(fileReader.result);
            };
            fileReader.onerror = (e) =>{
                reject(e);
            };

            if(file){
                fileReader.readAsDataURL(file);
            }else{
                resolve('dist/img/boxed-bg.jpg');
            }
        });
    }
    updateUsersCount(){

        let userNumber = 0;
        let adminUserNumber = 0;

        [...this.tableEl.children].forEach( (tr) => {
            
            let user = JSON.parse(tr.dataset.user);

            userNumber++;
            if(user._admin) adminUserNumber++;

        });

        document.querySelector("#users-number").innerHTML = userNumber;
        document.querySelector("#admin-users-number").innerHTML = adminUserNumber;
    }
    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e =>{
            this.showPanelCreate();
        });

        this.updateFormEl.addEventListener("submit", (e) => {
            e.preventDefault();

            let btn = this.updateFormEl.querySelector("[type=submit]");
            btn.disabled = true;

            let values = this.getValues(this.updateFormEl);
            let index = this.updateFormEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let oldUser = JSON.parse(tr.dataset.user);

            // Object assign copia o valor dos atributos de um objeto e retorna o mesmo atribuindo a variável result
            // Como parâmetro é passado primeiro o objeto que será copiado e o segundo parâmetro é o objeto que irá receber os dados do primeiro.
            let result = Object.assign({}, oldUser, values);

            // utilizando a promisse
            this.getPhoto(this.updateFormEl).then((content) =>{

                if(!values._photo){
                    result._photo = oldUser._photo;
                }else{
                    result._photo = content;
                }

                let user = new User();

                user.loadFromJSON(result);

                user.save();

                this.getTr(user, tr);

                tr.innerHTML = `
                <tr>
                    <td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${result._name}</td>
                    <td>${result._email}</td>
                    <td>${result._admin ? 'Sim' : 'Não'}</td>
                    <td>${Utils.dateFormat(result._register)}</td>
                    <td>
                    <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
                    <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
                    </td>
                </tr>
                `;                

                this.addTrEvents(tr);

                this.updateUsersCount();

                this.updateFormEl.reset();
                
                this.showPanelCreate();

                btn.disabled = false;
                
            }), (e) =>{

                console.error(e);
            }
        });
    }
    showPanelCreate(){
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }
    showPanelUpdate(){
        document.querySelector("#box-user-update").style.display = "block";
        document.querySelector("#box-user-create").style.display = "none";
    }
    addTrEvents(trEl){

        trEl.querySelector(".btn-delete").addEventListener("click", e =>{
            
            if(confirm("Deseja realmente excluir?")){

                let user = new User();

                user.loadFromJSON(JSON.parse(trEl.dataset.user));
                user.remove();
                
                trEl.remove();
                this.updateUsersCount();
            }
        });

        trEl.querySelector(".btn-edit").addEventListener("click", e =>{

            let json = JSON.parse(trEl.dataset.user);
            this.updateFormEl.dataset.trIndex = trEl.sectionRowIndex;

            for(let fieldName in json){
                
                let field = this.updateFormEl.querySelector(`[name="${fieldName.replace("_", "")}"]`);

                // continue é a palavra reservada utilizada dentro de um for in
                // continue irá ignorar o restante das instruções dentro daquele laço e irá para o próximo item do objeto

                if(field){

                    switch(field.type){
                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            field = this.updateFormEl.querySelector(`[name="${fieldName.replace("_", "")}"][value="${json[fieldName]}"]`);
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[fieldName];
                            break;
                        default:
                            field.value = json[fieldName];
                            break;
                    }

                    field.value = json[fieldName];
                }
            }

            this.updateFormEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();
        });        
    }

    selectAll(){

        let users = User.getStoragedUsers();

        users.forEach((userData) =>{

            let user = new User();

            user.loadFromJSON(userData);

            this.addLine(user);
        });

    }
}