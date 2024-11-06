// Define an interface for Person properties
interface PersonDetails {
    name: string;
    age: number;
    email?: string;  // Optional property
}

// Create a Person class
class Person {
    private details: PersonDetails;

    constructor(details: PersonDetails) {
        this.details = details;
    }

    public introduce(): string {
        return `Hi, I'm ${this.details.name} and I'm ${this.details.age} years old.`;
    }

    public hasEmail(): boolean {
        return !!this.details.email;
    }
}

// Create and use a Person instance
const person = new Person({
    name: "John Doe",
    age: 30,
    email: "john@example.com"
});

console.log(person.introduce());
console.log(`Has email? ${person.hasEmail()}`);