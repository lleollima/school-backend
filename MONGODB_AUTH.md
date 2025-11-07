# Guia de Configuração do MongoDB

## Problema: "Command find requires authentication"

Este erro ocorre quando o MongoDB está configurado para exigir autenticação.

## Soluções

### 1️⃣ Criar Usuário no MongoDB (Recomendado)

```bash
# Conectar ao MongoDB
mongosh --port 27018

# Executar no shell do MongoDB:
use admin

db.createUser({
  user: "school_admin",
  pwd: "school_password123",
  roles: [
    { role: "readWrite", db: "school_management_db" },
    { role: "dbAdmin", db: "school_management_db" }
  ]
})

# Sair
exit
```

Depois, atualize o arquivo `.env`:
```env
DATABASE_URL=mongodb://school_admin:school_password123@localhost:27018/school_management_db?authSource=admin
```

### 2️⃣ Desabilitar Autenticação (Apenas Desenvolvimento)

**Linux/Mac:**
```bash
# 1. Parar o MongoDB
sudo systemctl stop mongod

# 2. Editar configuração
sudo nano /etc/mongod.conf

# 3. Comentar as linhas de segurança:
# security:
#   authorization: enabled

# 4. Reiniciar
sudo systemctl start mongod
```

**Docker:**
```bash
# Se estiver usando Docker, inicie sem --auth
docker run -d -p 27018:27017 --name mongodb mongo:latest
```

Depois, use URL simples no `.env`:
```env
DATABASE_URL=mongodb://localhost:27018/school_management_db
```

### 3️⃣ Verificar MongoDB Existente

```bash
# Ver se há usuários criados
mongosh --port 27018
use admin
db.system.users.find()
```

### 4️⃣ Usar MongoDB Atlas (Nuvem)

1. Crie conta grátis em https://www.mongodb.com/cloud/atlas
2. Crie um cluster gratuito
3. Pegue a connection string
4. Atualize `.env`:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/school_management_db?retryWrites=true&w=majority
```

## Testando a Conexão

Após configurar, teste:

```bash
# Testar aplicação
pnpm start:dev

# Se funcionar, teste os seeds
pnpm seed
```

## Formato das URLs

### Sem autenticação:
```
mongodb://localhost:27018/database_name
```

### Com autenticação (usuário/senha):
```
mongodb://username:password@localhost:27018/database_name?authSource=admin
```

### MongoDB Atlas (nuvem):
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### Múltiplos hosts (replica set):
```
mongodb://username:password@host1:27017,host2:27017,host3:27017/database_name?replicaSet=rs0&authSource=admin
```

## Dicas de Segurança

⚠️ **Desenvolvimento:**
- Pode usar sem autenticação localmente
- Use senhas simples

✅ **Produção:**
- SEMPRE use autenticação
- Use senhas fortes
- Configure IP whitelist
- Use SSL/TLS

## Troubleshooting

### Erro: "Connection refused"
- MongoDB não está rodando
- Porta incorreta
- Firewall bloqueando

**Solução:**
```bash
# Verificar se está rodando
sudo systemctl status mongod

# Iniciar se necessário
sudo systemctl start mongod
```

### Erro: "Authentication failed"
- Usuário/senha incorretos
- authSource incorreto

**Solução:**
- Verifique credenciais
- Adicione `?authSource=admin` na URL

### Erro: "Network timeout"
- MongoDB não está acessível
- URL incorreta

**Solução:**
- Verifique se o MongoDB está rodando
- Teste conexão: `mongosh --port 27018`

