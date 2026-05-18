# Anotaciones personales sobre conceptos vistos en primer y segundo bimestre

## Introducción
En este proyecto de NexusBank pude ver cómo se conecta un backend con un frontend para formar una aplicación completa. Para mí, lo más importante fue entender que una app no solo es la parte visual, sino también la lógica que procesa datos, valida usuarios, protege rutas y guarda información de forma ordenada.

---

## Primer bimestre: base del backend y la lógica del sistema

### 1. Arquitectura cliente-servidor
Yo entendí que el sistema se divide en dos partes principales:
- **Frontend**: lo que el usuario ve y usa.
- **Backend**: la parte que recibe peticiones, procesa datos y responde.

En NexusBank, el frontend consume una API y el backend decide qué se puede hacer según el usuario, su rol y el estado de su cuenta.

### 2. API REST
Aprendí que una API REST organiza la comunicación entre frontend y backend usando métodos HTTP como:
- `GET` para consultar
- `POST` para crear
- `PUT` para actualizar
- `DELETE` para eliminar

Esto se ve en el backend cuando se manejan rutas como login, registro, cuentas, solicitudes y aprobaciones.

### 2.1 Conceptos técnicos que yo anoto
Yo pensaba que varias palabras del código eran solo “forma de escribir”, pero en realidad cada una tiene una función clara:
- **`async`**: indica que una función puede trabajar con operaciones que toman tiempo, como consultar una API o guardar datos.
- **`await`**: hace que el programa espere el resultado de una promesa antes de seguir. Yo lo entiendo como “espera este resultado y luego continúa”.
- **Promesa (`Promise`)**: representa una operación que todavía no termina, por ejemplo una petición al servidor.
- **`try/catch`**: sirve para intentar una operación y atrapar el error si algo falla, en vez de que toda la app se rompa.
- **`import` y `export`**: permiten dividir el código en archivos y reutilizar funciones o componentes.

En el proyecto esto se nota cuando el backend consulta la base de datos, envía correos o procesa solicitudes sin bloquear todo el sistema.

### 2.2 Rutas y control de acceso
Yo también entendí que las rutas son como los caminos de la aplicación. Cada ruta lleva a una pantalla o a una acción específica.

En el frontend vi que `AppRoutes` organiza toda la navegación y separa las páginas por función:
- login
- registro
- verificación de correo
- panel de cliente
- panel de admin
- panel de empleado

Eso me ayudó a entender que una app no debe tener todo mezclado, sino ordenado por rutas para que cada usuario entre solo a lo que necesita.

### 2.3 Protección de rutas
Para mí, una de las partes más importantes fue la protección de rutas. Yo entendí que no basta con que una página exista; también hay que revisar si el usuario realmente puede entrar.

El componente `ProtectedRoute` hace precisamente eso:
- revisa si existe token
- revisa el rol del usuario
- redirige si no tiene permiso

Eso me pareció muy importante porque en una banca no cualquiera puede entrar al panel de administrador o al panel del empleado. Esa protección hace que el sistema sea más seguro.

### 2.4 Estado de autenticación
También entendí que el login no solo guarda un usuario. El frontend mantiene datos como:
- usuario
- token
- refresh token
- si la sesión está activa
- el perfil del usuario

Eso está guardado en un store, y yo lo veo como una memoria central para no estar repitiendo las mismas consultas en cada pantalla.

### 3. Rutas, controladores y middleware
Para mí, una de las ideas más claras fue esta separación:
- **Ruta**: define la dirección del endpoint.
- **Controlador**: contiene la lógica principal.
- **Middleware**: revisa algo antes de dejar pasar la petición.

Por ejemplo, en el backend se usa autenticación, validación de roles y verificación de token antes de ejecutar acciones sensibles.

### 4. Autenticación y autorización
Este concepto me pareció clave porque no todos los usuarios pueden hacer lo mismo.
- **Autenticación**: comprobar quién es el usuario.
- **Autorización**: comprobar qué puede hacer.

En NexusBank se usan tokens JWT, roles como Cliente, Empleado y Admin, y protección de rutas para evitar accesos indebidos.

### 5. Validación de datos
Aprendí que antes de guardar información hay que revisarla. Eso evita errores, datos vacíos o formatos incorrectos.

En el proyecto se valida:
- correo electrónico
- contraseñas
- tipo de cuenta
- solicitudes pendientes
- permisos del usuario

Eso hace que el sistema sea más confiable.

### 5.1 Llamadas al backend
Yo también entendí que cuando el frontend usa algo como `axios` o `fetch`, en realidad está enviando una petición al servidor y esperando una respuesta.

Para mí eso significa:
- mandar datos del formulario
- esperar la respuesta
- mostrar éxito o error
- actualizar la pantalla si todo salió bien

Por eso muchas funciones del frontend usan `await`, porque así no siguen ejecutándose hasta saber qué respondió el backend.

### 6. Base de datos y ORM
También entendí que el backend no trabaja directo con tablas de forma manual, sino que puede usar un ORM como Sequelize para manejar modelos y relaciones.

Eso facilita:
- crear registros
- buscar datos
- actualizar información
- relacionar usuarios, cuentas y solicitudes

### 7. Variables de entorno
Yo aprendí que no todo se debe escribir directo en el código.
Se usan variables de entorno para datos sensibles como:
- secretos JWT
- credenciales SMTP
- URLs de backend o frontend
- configuración de base de datos

Esto mejora seguridad y permite cambiar configuración sin modificar todo el proyecto.

### 8. Manejo de correo
Otro concepto importante fue el envío de correos automáticos.
El sistema puede enviar notificaciones cuando:
- un usuario se registra
- una cuenta se aprueba
- una solicitud se rechaza
- se pide verificación de email

Para mí, esto demuestra cómo el backend también comunica eventos importantes al usuario.

### 9. Auditoría y control
Me quedó claro que un sistema bancario debe dejar registro de lo que pasa.
Por eso hay auditoría, logs y control de cambios, especialmente cuando se aprueban cuentas, se bloquean operaciones o se actualizan límites.

---

## Segundo bimestre: frontend, interacción y experiencia de usuario

### 1. Componentes reutilizables
En el frontend aprendí que React se organiza en componentes.
Eso ayuda a dividir la interfaz en partes pequeñas y reutilizables.

Por ejemplo:
- páginas de login y registro
- dashboard de cliente
- panel de admin
- listas y formularios
- rutas protegidas

### 2. Enrutamiento en React
Otro concepto importante fue el uso de rutas en el navegador.
El frontend cambia de pantalla sin recargar toda la página.

Se usan rutas para:
- login
- registro
- verificación de correo
- panel de cliente
- panel de admin
- panel de empleado

Eso hace que la navegación sea más rápida y ordenada.

### 3. Protección de rutas
Yo entendí que no basta con ocultar botones; también hay que proteger las páginas.
Si un usuario no tiene permiso, el sistema lo redirige.

En el proyecto eso se maneja con una ruta protegida que verifica:
- si existe token
- si el rol es correcto
- si el usuario puede entrar al panel correspondiente

### 4. Estado global
Aprendí que no siempre conviene guardar datos en cada componente por separado.
Para eso se usa un estado global.

En NexusBank se maneja sesión con un store que guarda:
- usuario
- token
- refresh token
- estado de autenticación
- datos del perfil

Esto simplifica el control de sesión en toda la app.

### 4.1 Persistencia de sesión
Yo entendí que guardar la sesión no es solo tener datos en memoria, sino también conservarlos aunque recargue la página.

En el proyecto eso se hace con persistencia del estado, algo que me parece útil porque:
- mantiene el login activo
- evita volver a escribir credenciales
- conserva el token y la información del usuario

Eso me ayudó a entender mejor para qué sirven `localStorage` o mecanismos parecidos.

### 4.2 Formularios de autenticación
En el frontend también vi que los formularios de login y registro tienen mucha importancia.
Para mí, esos formularios sirven para:
- pedir correo o usuario
- pedir contraseña
- enviar los datos al backend
- mostrar errores si algo sale mal

Yo aprendí que una interfaz bien hecha no solo pide datos, sino que también guía al usuario para que no se confunda.

### 5. Comunicación con el backend
El frontend no trabaja solo; consume endpoints del backend.
Yo entendí que la interfaz envía datos como formularios y el backend responde con mensajes, errores o datos.

Por ejemplo:
- iniciar sesión
- recuperar contraseña
- aprobar solicitudes
- consultar cuentas
- cargar notificaciones

### 5.1 Flujo de aprobación de cuentas
Una parte que me ayudó mucho a entender la lógica del sistema fue la aprobación de cuentas.

Yo lo veo así:
1. el cliente crea una solicitud
2. la solicitud queda pendiente
3. el admin entra a la vista de pendientes
4. el admin aprueba o rechaza
5. el backend actualiza el estado
6. el sistema notifica al usuario

Eso me enseñó que el backend no solo guarda datos, sino que también controla el ciclo completo de una acción.

### 5.2 Middleware y validaciones del backend
Yo también entendí que antes de llegar al controlador pasan filtros llamados middleware.

Esos middleware sirven para:
- revisar si hay token
- comprobar el rol
- validar datos de entrada
- evitar que usuarios no autorizados ejecuten acciones sensibles

Para mí esto es como un guardia antes de entrar a una oficina: primero revisa si todo está correcto y luego deja pasar.

### 6. Formularios y validaciones visuales
También vi que el frontend debe ayudar al usuario a ingresar datos correctamente.
Eso se logra con formularios, mensajes de error y estados de carga.

Eso mejora la experiencia porque el usuario sabe:
- qué campo está mal
- si la petición está cargando
- si se completó con éxito

### 7. Diseño y experiencia de usuario
Yo entendí que una interfaz bancaria debe verse clara, limpia y confiable.
No solo importa que funcione, también importa cómo se presenta.

El frontend del proyecto usa estilos separados por módulo para mantener orden y consistencia visual.

### 7.1 Componentes visuales y organización
También noté que el frontend se divide en componentes y vistas para no hacer una sola pantalla gigante.

Eso permite:
- reutilizar código
- cambiar una parte sin romper todo
- mantener el proyecto más ordenado
- entender mejor qué hace cada archivo

Yo aprendí que esto es muy útil cuando la aplicación crece, porque si todo estuviera en un solo archivo sería difícil de mantener.

---

## Conexión entre backend y frontend

Lo que más aprendí es que ambos lados dependen uno del otro:
- el **frontend** muestra la información y recoge acciones del usuario
- el **backend** valida, procesa y guarda todo

Cuando el admin aprueba una cuenta, por ejemplo:
1. el frontend manda la solicitud
2. el backend valida permisos
3. se crea o habilita la cuenta
4. se actualiza el estado
5. se notifica al usuario por correo o notificación

Eso demuestra el flujo completo de una aplicación real.

---

## Conclusión personal
En mi opinión, este proyecto me ayudó a entender mejor cómo se construye una aplicación profesional. Aprendí que el backend se encarga de la seguridad, la lógica y los datos, mientras que el frontend se encarga de la interacción con el usuario. También entendí que en un sistema bancario es esencial controlar roles, proteger rutas, validar información y dejar registro de todo.

Si tuviera que resumir lo aprendido en dos bimestres, diría que el primer bimestre me ayudó a comprender la estructura técnica del sistema y el segundo bimestre me ayudó a entender cómo esa lógica se presenta en una interfaz funcional y ordenada.
