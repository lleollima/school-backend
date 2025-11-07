# 🧪 Guia de Teste - Módulo de Usuários

## 🚀 Começando

### 1. Executar o Seed do Admin
```bash
npm run seed
```

Isso criará o usuário admin com as credenciais:
- **Email**: admin@school.com
- **Password**: admin123

### 2. Fazer Login como Admin
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@school.com",
  "password": "admin123"
}
```

Salve o `accessToken` retornado para usar nos próximos testes.

---

## 📝 Testes dos Endpoints

### ✅ 1. Criar Usuário (POST /users)

```bash
POST http://localhost:3000/users
Authorization: Bearer {SEU_TOKEN_AQUI}
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@school.com",
  "password": "senha123",
  "role": "student"
}
```

**Resultado Esperado**: Status 201, usuário criado com senha criptografada

### ✅ 2. Listar Todos os Usuários (GET /users)

```bash
GET http://localhost:3000/users
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resultado Esperado**: Lista de usuários (admin + João)

### ✅ 3. Listar com Filtro por Role (GET /users?role=student)

```bash
GET http://localhost:3000/users?role=student
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resultado Esperado**: Apenas usuários com role "student"

### ✅ 4. Listar com Paginação (GET /users?page=1&limit=5)

```bash
GET http://localhost:3000/users?page=1&limit=5
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resultado Esperado**: Máximo 5 usuários, com total e informações de paginação

### ✅ 5. Buscar Usuário por ID (GET /users/:id)

```bash
GET http://localhost:3000/users/{ID_DO_USUARIO}
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resultado Esperado**: Dados do usuário específico (sem senha)

### ✅ 6. Atualizar Usuário (PATCH /users/:id)

```bash
PATCH http://localhost:3000/users/{ID_DO_USUARIO}
Authorization: Bearer {SEU_TOKEN_AQUI}
Content-Type: application/json

{
  "name": "João da Silva Santos"
}
```

**Resultado Esperado**: Usuário atualizado com novo nome

### ✅ 7. Atualizar Senha (PATCH /users/:id)

```bash
PATCH http://localhost:3000/users/{ID_DO_USUARIO}
Authorization: Bearer {SEU_TOKEN_AQUI}
Content-Type: application/json

{
  "password": "novasenha123"
}
```

**Resultado Esperado**: Senha atualizada e criptografada

### ✅ 8. Deletar Usuário (DELETE /users/:id)

```bash
DELETE http://localhost:3000/users/{ID_DO_USUARIO}
Authorization: Bearer {SEU_TOKEN_AQUI}
```

**Resultado Esperado**: Status 200, mensagem de sucesso

---

## 🔒 Testes de Segurança

### ❌ 1. Criar Usuário sem Token

```bash
POST http://localhost:3000/users
Content-Type: application/json

{
  "name": "Teste",
  "email": "teste@school.com",
  "password": "senha123",
  "role": "student"
}
```

**Resultado Esperado**: Status 401 Unauthorized

### ❌ 2. Email Duplicado

```bash
POST http://localhost:3000/users
Authorization: Bearer {SEU_TOKEN_AQUI}
Content-Type: application/json

{
  "name": "Outro Nome",
  "email": "admin@school.com",
  "password": "senha123",
  "role": "student"
}
```

**Resultado Esperado**: Status 409 Conflict - Email já existe

### ❌ 3. Senha Muito Curta

```bash
POST http://localhost:3000/users
Authorization: Bearer {SEU_TOKEN_AQUI}
Content-Type: application/json

{
  "name": "Teste",
  "email": "teste@school.com",
  "password": "123",
  "role": "student"
}
```

**Resultado Esperado**: Status 400 Bad Request - Senha deve ter no mínimo 6 caracteres

### ❌ 4. Role Inválido

```bash
POST http://localhost:3000/users
Authorization: Bearer {SEU_TOKEN_AQUI}
Content-Type: application/json

{
  "name": "Teste",
  "email": "teste@school.com",
  "password": "senha123",
  "role": "invalid_role"
}
```

**Resultado Esperado**: Status 400 Bad Request - Role inválido

### ❌ 5. Email Inválido

```bash
POST http://localhost:3000/users
Authorization: Bearer {SEU_TOKEN_AQUI}
Content-Type: application/json

{
  "name": "Teste",
  "email": "email_invalido",
  "password": "senha123",
  "role": "student"
}
```

**Resultado Esperado**: Status 400 Bad Request - Email inválido

---

## 🎯 Checklist de Validação

- [ ] Admin criado com seed
- [ ] Login funcionando
- [ ] Token JWT válido
- [ ] Criar usuário student
- [ ] Criar usuário teacher
- [ ] Criar usuário parent
- [ ] Listar todos os usuários
- [ ] Filtrar por role=student
- [ ] Filtrar por role=teacher
- [ ] Paginação funcionando
- [ ] Buscar por ID válido
- [ ] Buscar por ID inválido (404)
- [ ] Atualizar nome
- [ ] Atualizar email
- [ ] Atualizar senha
- [ ] Atualizar role
- [ ] Deletar usuário
- [ ] Email duplicado retorna erro
- [ ] Senha curta retorna erro
- [ ] Role inválido retorna erro
- [ ] Senha não aparece nas respostas
- [ ] RefreshToken não aparece nas respostas

---

## 🛠️ Comandos Úteis

```bash
# Iniciar o servidor
npm run start:dev

# Criar dados seed
npm run seed

# Limpar todos os dados
npm run seed:drop

# Resetar banco (limpar + criar)
npm run seed:reset

# Testar conexão com banco
npm run db:test
```

---

## 📊 Exemplo de Resposta Completa

### GET /users?role=student&page=1&limit=2

```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@school.com",
      "role": "student",
      "createdAt": "2025-01-06T10:00:00.000Z",
      "updatedAt": "2025-01-06T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Maria Santos",
      "email": "maria@school.com",
      "role": "student",
      "createdAt": "2025-01-06T10:05:00.000Z",
      "updatedAt": "2025-01-06T10:05:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 2
}
```

---

## 🎓 Dicas

1. **Use o Postman ou Insomnia** para facilitar os testes
2. **Salve o token** em uma variável de ambiente
3. **Copie os IDs** dos usuários criados para testar UPDATE e DELETE
4. **Verifique no MongoDB** se as senhas estão criptografadas
5. **Teste todos os roles** (admin, teacher, parent, student)

Boa sorte com os testes! 🚀

