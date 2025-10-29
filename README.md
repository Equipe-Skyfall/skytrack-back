# SkyTrack Backend API

API backend completa para gerenciamento de estações meteorológicas, construída com Node.js, TypeScript, NestJS, PostgreSQL e MongoDB.

## Requisitos

- Node.js (v16 ou superior)
- PostgreSQL (v12 ou superior) OU Docker
- MongoDB (para dados dos sensores ESP32)
- npm ou yarn

## Como Executar Localmente

### 1. Clone o repositório

```bash
git clone <url-do-repositório>
cd SkyTrack
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Atualize o arquivo `.env` com suas credenciais do banco de dados.

### 4. Configure o PostgreSQL (escolha uma opção)

**Opção A: Instalação Local do PostgreSQL**
```sql
CREATE DATABASE skytrack;
```

**Opção B: Container Docker**
```bash
# Execute o PostgreSQL no Docker
docker run --name skytrack-postgres -e POSTGRES_PASSWORD=sua_senha -p 5432:5432 -d postgres

# Crie o banco de dados
docker exec skytrack-postgres psql -U postgres -c "CREATE DATABASE skytrack;"
```

**Opção C: Supabase (Recomendado)**
1. Crie um projeto no [supabase.com](https://supabase.com)
2. Obtenha a URL do banco de dados em Settings > Database
3. Atualize seu arquivo `.env` com as strings de conexão do Supabase:
```bash
# Para ambientes serverless (Vercel, Lambda)
DATABASE_URL="postgresql://postgres.SEU_PROJECT_ID:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Para desenvolvimento local
DIRECT_DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_ID.supabase.co:5432/postgres"
```

### 5. Configure o MongoDB (dados dos sensores ESP32)

O MongoDB é usado para armazenar dados brutos dos sensores ESP32, que são posteriormente migrados para o PostgreSQL.

**Opção A: MongoDB Atlas (Recomendado)**
1. Crie uma conta gratuita no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster
3. Obtenha a string de conexão
4. Atualize seu arquivo `.env`:
```bash
MONGO_CONNECTION_STRING="mongodb+srv://SEU_USER:SUA_SENHA@SEU_CLUSTER.mongodb.net/?retryWrites=true&w=majority"
MONGO_DATABASE="dadosClima"
MONGO_COLLECTION="clima"
```

**Opção B: MongoDB Local**
```bash
# Instale o MongoDB localmente ou use Docker
docker run --name skytrack-mongo -p 27017:27017 -d mongo

# Atualize o .env
MONGO_CONNECTION_STRING="mongodb://localhost:27017"
MONGO_DATABASE="dadosClima"
MONGO_COLLECTION="clima"
```

### 6. Configure a migração de dados (Opcional)

O sistema pode migrar automaticamente dados do MongoDB para o PostgreSQL:

```bash
# No arquivo .env, configure:
MIGRATION_ENABLED="true"                    # Habilita migração automática
MIGRATION_INTERVAL_MINUTES="15"            # Executa a cada 15 minutos
MIGRATION_BATCH_SIZE="100"                 # Processa 100 registros por vez
MIGRATION_SYNC_NAME="main_sync"            # Nome da sincronização
```

### 7. Configure o banco de dados com Prisma

```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações
npx prisma migrate dev
```

### 8. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

## Comandos Disponíveis

### Comandos de Desenvolvimento

```bash
# Iniciar o servidor de desenvolvimento com hot reload
npm run dev

# Iniciar o servidor de produção
npm start

# Compilar o projeto TypeScript
npm run build
```

### Comandos de Teste

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage
```

### Comandos de Qualidade de Código

```bash
# Executar ESLint para verificar problemas no código
npm run lint

# Executar ESLint e corrigir problemas automaticamente
npm run lint:fix

# Formatar código com Prettier
npm run format
```

### Comandos do Prisma

```bash
# Gerar cliente Prisma após mudanças no schema
npx prisma generate

# Criar e aplicar uma nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar o banco de dados (apenas desenvolvimento)
npx prisma migrate reset

# Abrir Prisma Studio para inspeção do banco de dados
npx prisma studio

# Enviar mudanças do schema sem migrations (desenvolvimento)
npx prisma db push
```

## Variáveis de Ambiente

```env
# Configuração do Servidor
PORT=3000
NODE_ENV=development
IS_SERVERLESS=false  # true para Vercel/Lambda, false para local/EC2

# PostgreSQL (Supabase) - Dados da aplicação
DATABASE_URL="postgresql://postgres.SEU_PROJECT_ID:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_ID.supabase.co:5432/postgres"

# MongoDB - Dados dos sensores ESP32
MONGO_CONNECTION_STRING="mongodb+srv://SEU_USER:SUA_SENHA@SEU_CLUSTER.mongodb.net/?retryWrites=true&w=majority"
MONGO_DATABASE="dadosClima"
MONGO_COLLECTION="clima"

# Migração MongoDB → PostgreSQL
MIGRATION_ENABLED="true"
MIGRATION_INTERVAL_MINUTES="15"
MIGRATION_BATCH_SIZE="100"
MIGRATION_SYNC_NAME="main_sync"

# CORS
CORS_ORIGINS="http://localhost:5173,http://localhost:3000,https://app.skytrack.space"
```

## Documentação da API

Com o servidor em execução, você pode acessar a documentação interativa da API em:
- **Swagger UI**: `http://localhost:3000/docs`

## Endpoints da API

### Estações Meteorológicas

- `GET /api/stations` - Listar todas as estações com filtros e paginação opcionais
- `GET /api/stations/:id` - Obter uma estação específica por ID
- `POST /api/stations` - Criar uma nova estação
- `PUT /api/stations/:id` - Atualizar uma estação existente
- `DELETE /api/stations/:id` - Deletar uma estação

### Alertas

- `GET /api/alerts` - Obter todos os alertas (público, paginado, filtrável por nível, busca, is_active)
- `GET /api/alerts/:id` - Obter alerta por ID (público)
- `GET /api/alerts/mac/:macAddress` - Obter alertas de uma estação específica (público)
- `POST /api/alerts` - Criar novo alerta (requer autenticação)
- `PUT /api/alerts/:id` - Atualizar alerta (alterna status ativo/inativo)
- `DELETE /api/alerts/:id` - Deletar alerta

**Nota sobre Alertas**: O sistema permite criar **múltiplos alertas para a mesma estação**, inclusive com os mesmos parâmetros e tipos de alerta. Não há restrições de unicidade.

### Parâmetros

- `GET /api/parameters` - Listar todos os parâmetros
- `GET /api/parameters/:id` - Obter um parâmetro específico

### Leituras de Sensores

- `GET /api/sensor-readings` - Obter leituras dos sensores
- `POST /api/sensor-readings` - Registrar nova leitura

### Tipos de Alerta

- `GET /api/tipo-alerta` - Listar tipos de alertas disponíveis
- `GET /api/tipo-alerta/:id` - Obter tipo de alerta específico
- `POST /api/tipo-alerta` - Criar novo tipo de alerta
- `PUT /api/tipo-alerta/:id` - Atualizar tipo de alerta
- `DELETE /api/tipo-alerta/:id` - Deletar tipo de alerta

### Tipos de Parâmetro

- `GET /api/tipo-parametro` - Listar tipos de parâmetros
- `GET /api/tipo-parametro/:id` - Obter tipo de parâmetro específico

### Migração (MongoDB → PostgreSQL)

- `GET /api/migration/status` - Verificar status da migração
- `POST /api/migration/run` - Executar migração manualmente

### Health Check

- `GET /api/health` - Verificar status de saúde da API

## Modelo de Dados

### Estação

```typescript
interface Station {
  id: string;          // UUID
  name: string;        // 1-100 caracteres
  latitude: number;    // -90 a 90
  longitude: number;   // -180 a 180
  description?: string; // Opcional, máx 500 caracteres
  status: 'ACTIVE' | 'INACTIVE'; // Padrão: ACTIVE
  createdAt: Date;
  updatedAt: Date;
}
```

### Alerta

```typescript
interface RegisteredAlert {
  id: string;           // UUID
  stationId: string;    // MAC address da estação
  parameterId: string;  // ID do parâmetro monitorado
  tipoAlertaId: string; // ID do tipo de alerta
  medidasId?: string;   // ID da leitura que acionou o alerta (opcional)
  active: boolean;      // Status do alerta (ativo/inativo)
  data: Date;           // Data do alerta
  createdAt: Date;      // Data de criação
}
```

## Fluxo de Desenvolvimento

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Faça suas alterações** e o servidor recarregará automaticamente

3. **Execute os testes** para garantir que tudo funciona:
   ```bash
   npm test
   ```

4. **Verifique a qualidade do código**:
   ```bash
   npm run lint
   npm run format
   ```

5. **Compile para produção**:
   ```bash
   npm run build
   ```

## Estrutura do Projeto

```
prisma/
├── migrations/       # Arquivos de migração do banco de dados
└── schema.prisma     # Definição do schema do banco de dados

src/
├── alerts/           # Módulo de alertas
├── config/           # Arquivos de configuração (database, swagger, prisma)
├── controllers/      # Handlers de requisições HTTP
├── factories/        # Factories de entidades
├── middleware/       # Middleware Express (validação, tratamento de erros)
├── repositories/     # Camada de acesso a dados (usando Prisma)
├── routes/           # Definições de rotas
├── services/         # Camada de lógica de negócio
├── types/            # Interfaces e tipos TypeScript
├── container/        # Container de injeção de dependências
└── server.ts         # Ponto de entrada da aplicação

tests/
└── unit/            # Testes unitários
```

## Princípios de Arquitetura

Este projeto segue os princípios de arquitetura limpa:

- **Princípios SOLID**: Responsabilidade única, aberto/fechado, substituição de Liskov, segregação de interface, inversão de dependência
- **Padrão Repository**: Abstrai a lógica de acesso a dados
- **Padrão Factory**: Cria instâncias de entidades
- **Injeção de Dependências**: Gerencia dependências e possibilita testes
- **Camada de Serviço**: Contém a lógica de negócio
- **Camada de Validação**: Garante a integridade dos dados

## Licença

MIT
