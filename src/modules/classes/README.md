# Classes Module

## 📋 Descrição
Módulo responsável pela gestão de turmas (classes) no sistema escolar. Permite criar turmas, atribuir professores e matricular estudantes.

## 🗂️ Estrutura
```
src/modules/classes/
├─ classes.controller.ts    # Controller com endpoints REST
├─ classes.service.ts        # Lógica de negócio
├─ classes.module.ts         # Configuração do módulo
├─ schemas/
│  └─ class.schema.ts        # Schema Mongoose da turma
└─ dto/
   ├─ create-class.dto.ts    # DTO para criação de turma
   ├─ update-class.dto.ts    # DTO para atualização de turma
   └─ assign-student.dto.ts  # DTO para atribuir estudante
```

## 📊 Schema de Dados

### Class
```typescript
{
  name: string;           // Nome da turma (obrigatório)
  teacher: ObjectId;      // Referência ao professor (User)
  students: ObjectId[];   // Array de referências aos estudantes (User)
  year: number;           // Ano letivo (obrigatório)
  createdAt: Date;        // Data de criação (automático)
  updatedAt: Date;        // Data de atualização (automático)
}
```

## 🔌 Endpoints

### POST /classes
Criar nova turma
- **Roles**: admin, teacher
- **Body**: 
```json
{
  "name": "Turma A",
  "year": 2024,
  "teacher": "teacherId" // opcional
}
```
- **Response**: Objeto da turma com teacher e students populados

### GET /classes
Listar todas as turmas
- **Roles**: admin, teacher, student
- **Response**: Array de turmas com teacher e students populados

### GET /classes/:id
Obter turma por ID
- **Roles**: admin, teacher, student
- **Response**: Objeto da turma com teacher e students populados

### PUT /classes/:id
Atualizar turma
- **Roles**: admin, teacher
- **Body**: 
```json
{
  "name": "Turma A - Atualizado",
  "year": 2025,
  "teacher": "newTeacherId"
}
```
- **Response**: Objeto da turma atualizada com teacher e students populados

### POST /classes/:id/teacher/:teacherId
Atribuir professor a uma turma
- **Roles**: admin
- **Response**: Objeto da turma com teacher e students populados

### POST /classes/:id/student/:studentId
Adicionar estudante à turma
- **Roles**: admin, teacher
- **Response**: Objeto da turma com teacher e students populados

### DELETE /classes/:id/student/:studentId
Remover estudante da turma
- **Roles**: admin, teacher
- **Response**: Objeto da turma com teacher e students populados

### DELETE /classes/:id
Deletar turma
- **Roles**: admin
- **Response**: Status 200

## 🛡️ Validações

### Criação de Turma
- Nome é obrigatório
- Ano é obrigatório
- Se teacher for fornecido:
  - Usuário deve existir
  - Usuário deve ter role 'teacher'

### Atribuição de Professor
- Professor deve existir
- Usuário deve ter role 'teacher'

### Adição de Estudante
- Estudante deve existir
- Usuário deve ter role 'student'
- Estudante não pode estar já matriculado na turma

## 🔐 Autenticação e Autorização
Todos os endpoints requerem:
- JWT válido (JwtAuthGuard)
- Role apropriada (RolesGuard)

## 💡 Funcionalidades Principais

### ClassesService

#### createClass(dto)
Cria uma nova turma com validações

#### getAllClasses()
Retorna todas as turmas com teacher e students populados

#### getClassById(id)
Busca turma por ID com teacher e students populados

#### updateClass(id, dto)
Atualiza dados da turma com validações

#### assignTeacher(classId, teacherId)
Atribui um professor à turma

#### addStudent(classId, studentId)
Adiciona um estudante à turma (evita duplicatas)

#### removeStudent(classId, studentId)
Remove um estudante da turma

#### deleteClass(id)
Remove uma turma do sistema

## 🔄 Populate
Todas as respostas incluem:
- `.populate('teacher')` - Dados completos do professor
- `.populate('students')` - Dados completos dos estudantes

## 📝 Exemplos de Uso

### Criar Turma
```bash
POST /classes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Matemática Avançada",
  "year": 2024,
  "teacher": "507f1f77bcf86cd799439011"
}
```

### Adicionar Estudante
```bash
POST /classes/507f191e810c19729de860ea/student/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

### Listar Turmas
```bash
GET /classes
Authorization: Bearer <token>
```

## ⚠️ Tratamento de Erros

- **404 Not Found**: Turma, professor ou estudante não encontrado
- **400 Bad Request**: 
  - Usuário não é professor
  - Usuário não é estudante
  - Estudante já matriculado na turma
- **401 Unauthorized**: Token inválido ou ausente
- **403 Forbidden**: Usuário sem permissão para a ação

