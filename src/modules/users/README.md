# Módulo de Usuários 👥

Este módulo gerencia todos os usuários do sistema escolar.

## 📋 Funcionalidades

- ✅ Criar usuários
- ✅ Listar usuários com filtros e paginação
- ✅ Buscar usuário por ID
- ✅ Atualizar usuários
- ✅ Deletar usuários
- ✅ Criptografia de senha com bcrypt
- ✅ Proteção por roles (admin, teacher, parent, student)

## 🔐 Roles

- **admin**: Acesso total ao sistema
- **teacher**: Pode visualizar usuários
- **parent**: Responsáveis pelos alunos
- **student**: Alunos

## 📡 Endpoints

### GET /users
Lista todos os usuários com filtros e paginação.

**Permissões**: `admin`, `teacher`

**Query Parameters**:
- `role` (opcional): Filtrar por role (admin, teacher, parent, student)
- `page` (opcional): Número da página (default: 1)
- `limit` (opcional): Itens por página (default: 10)

**Exemplo**:
```bash
GET /users?role=student&page=1&limit=10
```

**Resposta**:
```json
{
  "users": [
    {
      "_id": "...",
      "name": "João Silva",
      "email": "joao@school.com",
      "role": "student",
      "createdAt": "2025-01-06T...",
      "updatedAt": "2025-01-06T..."
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### GET /users/:id
Busca um usuário específico por ID.

**Permissões**: `admin`, `teacher`

**Exemplo**:
```bash
GET /users/507f1f77bcf86cd799439011
```

**Resposta**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@school.com",
  "role": "student",
  "createdAt": "2025-01-06T...",
  "updatedAt": "2025-01-06T..."
}
```

### POST /users
Cria um novo usuário.

**Permissões**: `admin`

**Body**:
```json
{
  "name": "Maria Santos",
  "email": "maria@school.com",
  "password": "senha123",
  "role": "student"
}
```

**Validações**:
- `name`: obrigatório, string
- `email`: obrigatório, formato de email válido, único
- `password`: obrigatório, mínimo 6 caracteres
- `role`: obrigatório, enum (admin, teacher, parent, student)

**Resposta**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Maria Santos",
  "email": "maria@school.com",
  "role": "student",
  "createdAt": "2025-01-06T...",
  "updatedAt": "2025-01-06T..."
}
```

### PATCH /users/:id
Atualiza um usuário existente.

**Permissões**: `admin`

**Body** (todos os campos são opcionais):
```json
{
  "name": "Maria Santos Silva",
  "email": "maria.santos@school.com",
  "password": "novasenha123",
  "role": "teacher"
}
```

**Validações**:
- `name`: opcional, string
- `email`: opcional, formato de email válido, único
- `password`: opcional, mínimo 6 caracteres
- `role`: opcional, enum (admin, teacher, parent, student)

**Resposta**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Maria Santos Silva",
  "email": "maria.santos@school.com",
  "role": "teacher",
  "createdAt": "2025-01-06T...",
  "updatedAt": "2025-01-06T..."
}
```

### DELETE /users/:id
Deleta um usuário.

**Permissões**: `admin`

**Exemplo**:
```bash
DELETE /users/507f1f77bcf86cd799439011
```

**Resposta**:
```json
{
  "message": "User with ID 507f1f77bcf86cd799439011 has been deleted successfully"
}
```

## 🔒 Segurança

- Todas as senhas são criptografadas com bcrypt (salt rounds: 10)
- Senhas e refresh tokens nunca são retornados nas respostas
- Endpoints protegidos por JWT e Guards de Roles

## 🌱 Seeder

Um usuário administrador padrão é criado automaticamente ao rodar o seed:

**Credenciais**:
- Email: `admin@school.com`
- Senha: `admin123`

**Comandos**:
```bash
# Criar usuário admin
npm run seed

# Remover todos os dados
npm run seed:drop

# Resetar banco (drop + seed)
npm run seed:reset
```

## 🎯 Uso no Código

### Importar o módulo
```typescript
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

### Injetar o serviço
```typescript
import { UsersService } from './modules/users/users.service';

constructor(private usersService: UsersService) {}

// Criar usuário
const user = await this.usersService.createUser({
  name: 'João',
  email: 'joao@school.com',
  password: 'senha123',
  role: 'student',
});

// Listar usuários
const result = await this.usersService.findAll({
  role: 'student',
  page: '1',
  limit: '10',
});

// Buscar por ID
const user = await this.usersService.findById('507f1f77bcf86cd799439011');

// Atualizar
const updated = await this.usersService.updateUser('507f1f77bcf86cd799439011', {
  name: 'João Silva',
});

// Deletar
await this.usersService.deleteUser('507f1f77bcf86cd799439011');
```

## 📊 Schema

```typescript
{
  name: string;           // Nome completo
  email: string;          // Email único
  password: string;       // Senha criptografada
  role: string;           // admin | teacher | parent | student
  refreshToken?: string;  // Token de refresh (opcional)
  createdAt: Date;        // Data de criação (automático)
  updatedAt: Date;        // Data de atualização (automático)
}
```

## ⚠️ Erros Comuns

### 409 Conflict
Email já existe no sistema.

### 404 Not Found
Usuário não encontrado com o ID fornecido.

### 401 Unauthorized
Token JWT inválido ou expirado.

### 403 Forbidden
Usuário não tem permissão para acessar o recurso.

### 400 Bad Request
Dados inválidos no body da requisição.

